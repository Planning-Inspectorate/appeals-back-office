import logger from '#lib/logger.js';
import { correctionNoticePage } from './update-decision-letter.mapper.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { simpleHtmlComponent, wrapComponents } from '#lib/mappers/index.js';
import { mapUncommittedDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import config from '@pins/appeals.web/environment/config.js';
import { createNewDocumentVersion } from '#app/components/file-uploader.component.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';

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
		currentAppeal: { appealReference },
		session: {
			updateDecisionLetter: { correctionNotice },
			inspectorDecision
		}
	} = request;
	const baseUrl = request.baseUrl;
	const file = inspectorDecision?.files?.[0];

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
						file.name
					)}" class="govuk-link">${file.name}</a>`,
					actions: {
						Change: {
							href: `${baseUrl}/upload-decision-letter`,
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
				wrapComponents(
					[
						simpleHtmlComponent(
							'a',
							{
								href: `${baseUrl}/preview-email`,
								class: 'govuk-link'
							},
							'Preview email'
						)
					],
					{
						opening: '<p class="govuk-body">',
						closing: '</p>'
					}
				)
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

		return response.redirect(`/appeals-service/appeal-details/${appealId}/appeal-decision`);
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
