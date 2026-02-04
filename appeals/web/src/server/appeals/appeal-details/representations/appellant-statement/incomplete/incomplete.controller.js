import {
	prepareRejectionReasons,
	rejectionReasonHtml
} from '#appeals/appeal-details/representations/common/components/reject-reasons.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { addBusinessDays, dateISOStringToDisplayDate } from '#lib/dates.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { newLine2LineBreak } from '#lib/string-utilities.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { capitalize } from 'lodash-es';
import { mapRejectionReasonOptionsToCheckboxItemParameters } from '../../common/render-select-rejection-reasons.js';
import { mapRejectionReasonPayload } from '../../representations.mapper.js';
import {
	getRepresentationRejectionReasonOptions,
	representationIncomplete,
	updateRejectionReasons
} from '../../representations.service.js';
import { rejectAppellantStatementPage, setNewDatePage } from './incomplete.mapper.js';

const statusFormatMap = {
	[COMMENT_STATUS.INCOMPLETE]: 'Statement incomplete'
};

/** @type {import('express').Handler}
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 **/
export async function renderReasons(request, response) {
	const { params, currentAppeal, currentRepresentation, apiClient, session, errors } = request;

	const rejectionReasons = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
		currentRepresentation,
		rejectionReasons,
		session,
		['appellantStatement', params.appealId],
		errors
	);

	const pageContent = rejectAppellantStatementPage(currentAppeal);

	return response.status(200).render('appeals/appeal/reject-representation.njk', {
		errors,
		pageContent,
		rejectionReasons: mappedRejectionReasons
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 * @param {import('express').NextFunction} next
 */
export const postReasons = async (request, response, next) => {
	const {
		params: { appealId },
		errors
	} = request;

	if (errors) {
		return renderReasons(request, response, next);
	}

	return response
		.status(200)
		.redirect(`/appeals-service/appeal-details/${appealId}/appellant-statement/incomplete/date`);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderSetNewDate(request, response) {
	const extendedDeadline = await addBusinessDays(request.apiClient, new Date(), 3);
	const deadlineString = dateISOStringToDisplayDate(extendedDeadline.toISOString());
	const pageContent = setNewDatePage(request.currentAppeal, deadlineString);

	return response
		.status(request.errors ? 400 : 200)
		.render('patterns/check-and-confirm-page.pattern.njk', {
			errors: request.errors,
			pageContent
		});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postSetNewDate = async (request, response) => {
	const {
		params: { appealId },
		errors
	} = request;

	if (errors) {
		return renderSetNewDate(request, response);
	}

	return response
		.status(200)
		.redirect(`/appeals-service/appeal-details/${appealId}/appellant-statement/incomplete/confirm`);
};

/**
 * @type {import('@pins/express').RenderHandler<{}>}
 */
export const renderCheckYourAnswers = async (
	{
		errors,
		currentAppeal: { appealReference, appealId },
		currentRepresentation,
		session,
		apiClient
	},
	response
) => {
	const reasonOptions = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const appellantStatement = session.appellantStatement[appealId];

	const rejectionReasons = prepareRejectionReasons(
		appellantStatement,
		appellantStatement.rejectionReason,
		reasonOptions
	);

	const filteredAttachments = currentRepresentation.attachments?.filter((attachment) => {
		const { isDeleted, latestVersionId } = attachment?.documentVersion?.document ?? {};
		return latestVersionId === attachment.version && !isDeleted;
	});

	const attachmentsList = filteredAttachments?.length
		? buildHtmlList({
				items: filteredAttachments.map(
					(a) =>
						`<a class="govuk-link" href="${mapDocumentDownloadUrl(
							a.documentVersion.document.caseId,
							a.documentVersion.document.guid,
							a.documentVersion.document.name
						)}" target="_blank">${a.documentVersion.document.name}</a>`
				),
				isOrderedList: true,
				isNumberedList: filteredAttachments.length > 1
			})
		: null;

	const folderId =
		currentRepresentation.attachments?.[0]?.documentVersion?.document?.folderId ?? null;

	return renderCheckYourAnswersComponent(
		{
			title: 'Check details and confirm statement is incomplete',
			heading: 'Check details and confirm statement is incomplete',
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/appellant-statement/incomplete/date`,
			submitButtonText: 'Confirm statement is incomplete',
			responses: {
				Statement: {
					html: '',
					pageComponents: [
						{
							type: 'show-more',
							parameters: {
								html: newLine2LineBreak(currentRepresentation.originalRepresentation),
								labelText: 'Statement'
							}
						}
					]
				},
				'Supporting documents': {
					value: !attachmentsList?.length ? 'No documents' : undefined,
					html: attachmentsList?.length ? attachmentsList : undefined,
					actions: {
						Manage: {
							href: `/appeals-service/appeal-details/${appealId}/appellant-statement/manage-documents/${folderId}/?backUrl=/appellant-statement/incomplete/confirm`,
							visuallyHiddenText: 'supporting documents'
						},
						Add: {
							href: `/appeals-service/appeal-details/${appealId}/appellant-statement/add-document/?backUrl=/appellant-statement/incomplete/confirm`,
							visuallyHiddenText: 'supporting documents'
						}
					}
				},
				'Review decision': {
					value: statusFormatMap[appellantStatement.status],
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/appellant-statement`,
							visuallyHiddenText: 'Review decision'
						}
					}
				},
				'Why is the statement incomplete?': {
					html: '',
					pageComponents: [
						{
							type: 'show-more',
							parameters: {
								html: rejectionReasonHtml(rejectionReasons),
								labelText: 'Read more'
							}
						}
					],
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/appellant-statement/incomplete/reasons`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				},
				'Do you want to allow the Appellant to resubmit their statement?': {
					html: capitalize(appellantStatement?.setNewDate),
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/appellant-statement/incomplete/date`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				}
			},
			after: [
				simpleHtmlComponent(
					'p',
					{ class: 'govuk-body' },
					'We’ll send an email to the appellant to explain why their statement is incomplete.'
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
export const postCheckYourAnswers = async (request, response) => {
	const {
		apiClient,
		params: { appealId },
		session,
		currentRepresentation
	} = request;

	const rejectionReasons = mapRejectionReasonPayload(session.appellantStatement[appealId]);

	await updateRejectionReasons(
		apiClient,
		appealId,
		String(currentRepresentation.id),
		rejectionReasons
	);

	await representationIncomplete(apiClient, parseInt(appealId), currentRepresentation.id, {
		allowResubmit: session.appellantStatement[appealId].setNewDate
	});

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: 'appellantStatementIncomplete',
		appealId
	});

	return response.status(200).redirect(`/appeals-service/appeal-details/${appealId}`);
};
