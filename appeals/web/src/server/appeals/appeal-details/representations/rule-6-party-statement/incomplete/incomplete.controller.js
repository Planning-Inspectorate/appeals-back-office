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
import { rejectRule6PartyStatementPage, setNewDatePage } from './incomplete.mapper.js';

const statusFormatMap = {
	[COMMENT_STATUS.INCOMPLETE]: 'Statement incomplete'
};

/** @type {import('express').Handler}
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 **/
export async function renderReasons(request, response) {
	const {
		params: { appealId, rule6PartyId },
		currentAppeal,
		currentRepresentation,
		apiClient,
		session,
		errors
	} = request;

	const rejectionReasons = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
		currentRepresentation,
		rejectionReasons,
		session,
		['rule6PartyStatement', appealId],
		errors
	);

	const pageContent = rejectRule6PartyStatementPage(currentAppeal, rule6PartyId);

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
		params: { appealId, rule6PartyId },
		errors
	} = request;

	if (errors) {
		return renderReasons(request, response, next);
	}

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/incomplete/date`
		);
};

/**
 *
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export async function renderSetNewDate(request, response) {
	const {
		params: { rule6PartyId }
	} = request;
	const extendedDeadline = await addBusinessDays(request.apiClient, new Date(), 3);
	const deadlineString = dateISOStringToDisplayDate(extendedDeadline.toISOString());
	const pageContent = setNewDatePage(request.currentAppeal, deadlineString, rule6PartyId);

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
		params: { appealId, rule6PartyId },
		errors
	} = request;

	if (errors) {
		return renderSetNewDate(request, response);
	}

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/incomplete/confirm`
		);
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
		apiClient,
		params: { rule6PartyId }
	},
	response
) => {
	const reasonOptions = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const rule6PartyStatement = session.rule6PartyStatement[appealId];

	const rejectionReasons = prepareRejectionReasons(
		rule6PartyStatement,
		rule6PartyStatement.rejectionReason,
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
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/incomplete/date`,
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
							href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/manage-documents/${folderId}/?backUrl=/rule-6-party-statement/${rule6PartyId}/incomplete/confirm`,
							visuallyHiddenText: 'supporting documents'
						},
						Add: {
							href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/add-document/?backUrl=/rule-6-party-statement/${rule6PartyId}/incomplete/confirm`,
							visuallyHiddenText: 'supporting documents'
						}
					}
				},
				'Review decision': {
					value: statusFormatMap[rule6PartyStatement.status],
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}`,
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
							href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/incomplete/reasons`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				},
				'Do you want to allow the rule 6 party to resubmit their statement?': {
					html: capitalize(rule6PartyStatement?.setNewDate),
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/rule-6-party-statement/${rule6PartyId}/incomplete/date`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				}
			},
			after: [
				simpleHtmlComponent(
					'p',
					{ class: 'govuk-body' },
					'We’ll send an email to the rule 6 party to explain why their statement is incomplete.'
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

	const rejectionReasons = mapRejectionReasonPayload(session.rule6PartyStatement[appealId]);

	await updateRejectionReasons(
		apiClient,
		appealId,
		String(currentRepresentation.id),
		rejectionReasons
	);

	await representationIncomplete(apiClient, parseInt(appealId), currentRepresentation.id, {
		allowResubmit: session.rule6PartyStatement[appealId].setNewDate
	});

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey: 'rule6PartyStatementIncomplete',
		appealId,
		text: `${currentRepresentation.author} statement is incomplete`
	});

	return response.status(200).redirect(`/appeals-service/appeal-details/${appealId}`);
};
