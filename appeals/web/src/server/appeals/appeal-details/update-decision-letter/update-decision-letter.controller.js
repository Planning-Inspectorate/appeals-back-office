import { createNewDocumentVersion } from '#app/components/file-uploader.component.js';
import { mapUncommittedDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { getFileInfo } from '#appeals/appeal-documents/appeal.documents.service.js';
import { appealSiteToAddressString } from '#lib/address-formatter.js';
import { generateNotifyPreview } from '#lib/api/notify-preview.api.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { dateISOStringToDisplayDate } from '#lib/dates.js';
import logger from '#lib/logger.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { addBackLinkQueryToUrl } from '#lib/url-utilities.js';
import config from '@pins/appeals.web/environment/config.js';
import { getTeamFromAppealId } from '../update-case-team/update-case-team.service.js';
import { correctionNoticePage } from './update-decision-letter.mapper.js';

/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getCorrectionNotice = async (request, response) => {
	renderCorrectionNotice(request, response);
};
/** @type {import('@pins/express').RequestHandler<Response>}  */
export const getUpdateDocumentCheckDetails = async (request, response) => {
	renderUpdateDocumentCheckDetails(request, response);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderCorrectionNotice = async (request, response) => {
	const { errors, currentAppeal } = request;
	const mappedPageContent = correctionNoticePage(
		currentAppeal.appealId,
		currentAppeal.appealReference,
		request.session.updateDecisionLetter?.correctionNotice || '',
		errors
	);

	return response.status(200).render('patterns/change-page.pattern.njk', {
		pageContent: mappedPageContent,
		errors
	});
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const renderUpdateDocumentCheckDetails = async (request, response) => {
	const {
		errors,
		currentAppeal: {
			appealSite,
			appealReference,
			planningApplicationReference,
			appealId,
			decision
		},
		session: {
			updateDecisionLetter: { correctionNotice },
			inspectorDecision
		}
	} = request;
	const baseUrl = request.baseUrl;
	const file = inspectorDecision?.files?.[0];

	const fileInfo = await getFileInfo(request.apiClient, appealId, decision.documentId);

	if (!fileInfo) {
		return response.status(404).render('app/404');
	}

	if (!('latestDocumentVersion' in fileInfo) || !('name' in fileInfo)) {
		return response.status(500).render('app/500.njk');
	}

	const documentVersion = fileInfo.latestDocumentVersion.version + 1;
	const documentName = fileInfo.name;
	const { email: assignedTeamEmail } = await getTeamFromAppealId(request.apiClient, appealId);
	const personalisation = {
		appeal_reference_number: appealReference,
		site_address: appealSiteToAddressString(appealSite),
		lpa_reference: planningApplicationReference,
		correction_notice_reason: correctionNotice,
		decision_date: dateISOStringToDisplayDate(file.receivedDate),
		team_email_address: assignedTeamEmail
	};
	const templateName = 'correction-notice-decision.content.md';
	const template = await generateNotifyPreview(request.apiClient, templateName, personalisation);
	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and update decision letter',
			heading: 'Check details and update decision letter',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `${baseUrl}/correction-notice`,
			submitButtonText: 'Update decision letter',
			responses: {
				'Decision letter': {
					html: `<a href="${mapUncommittedDocumentDownloadUrl(
						appealReference,
						file.GUID,
						documentName,
						documentVersion
					)}" class="govuk-link">${documentName}</a>`,
					actions: {
						Change: {
							href: `${addBackLinkQueryToUrl(request, `${baseUrl}/upload-decision-letter`)}`,
							visuallyHiddenText: 'decision letter'
						}
					}
				},
				'Correction notice': {
					html: '',
					pageComponents: [
						{
							type: 'show-more',
							parameters: {
								text: correctionNotice,
								labelText: 'Correction notice'
							}
						}
					],
					actions: {
						Change: {
							href: `${baseUrl}/correction-notice`,
							visuallyHiddenText: 'correction notice'
						}
					}
				}
			},
			after: [
				simpleHtmlComponent(
					'p',
					{ class: 'govuk-body' },
					'We will send the updated decision letter to the relevant parties.'
				),

				{
					type: 'details',
					wrapperHtml: {
						opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
						closing: '</div></div>'
					},
					parameters: {
						summaryText: `Preview email`,
						html: template.renderedHtml
					}
				}
			]
		},
		response,
		errors
	);
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postUpdateDocumentCheckDetails = async (request, response) => {
	try {
		const {
			errors,
			currentAppeal: { appealId },
			currentAppeal,
			session: {
				updateDecisionLetter: { correctionNotice },
				inspectorDecision
			}
		} = request;
		const uploadInfo = inspectorDecision.files[0];
		const currentDecision = currentAppeal.decision;
		const notRedactedStatusID = 2;

		if (errors) {
			return renderUpdateDocumentCheckDetails(request, response);
		}

		/** @type {import('@pins/appeals/index.js').AddDocumentVersionRequest} */
		const addDocumentVersionRequestPayload = {
			blobStorageHost:
				config.useBlobEmulator === true ? config.blobEmulatorSasUrl : config.blobStorageUrl,
			blobStorageContainer: config.blobStorageDefaultContainer,
			document: {
				caseId: appealId,
				documentName: uploadInfo.name,
				documentType: uploadInfo.documentType,
				mimeType: uploadInfo.mimeType,
				documentSize: uploadInfo.size,
				stage: uploadInfo.stage,
				folderId: inspectorDecision.folderId,
				GUID: uploadInfo.GUID,
				receivedDate: uploadInfo.receivedDate,
				redactionStatusId: notRedactedStatusID,
				blobStoragePath: uploadInfo.blobStoreUrl
			},
			correctionNotice
		};

		await createNewDocumentVersion(
			request.apiClient,
			appealId,
			currentDecision.documentId,
			addDocumentVersionRequestPayload
		);

		addNotificationBannerToSession({
			session: request.session,
			bannerDefinitionKey: 'decisionLetterUpdated',
			appealId,
			text: 'Decision letter updated'
		});

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/issue-decision/view-decision`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postCorrectionNotice = async (request, response) => {
	try {
		const { appealId } = request.params;
		const { correctionNotice } = request.body;
		const { errors } = request;

		/** @type {import('./update-decision-letter.types.js').UpdateDecisionLetterRequest} */
		request.session.updateDecisionLetter = {
			...request.session.updateDecisionLetter,
			correctionNotice: correctionNotice
		};

		if (errors) {
			return renderCorrectionNotice(request, response);
		}

		return response.redirect(
			`/appeals-service/appeal-details/${appealId}/update-decision-letter/check-details`
		);
	} catch (error) {
		logger.error(error);
		return response.status(500).render('app/500.njk');
	}
};
