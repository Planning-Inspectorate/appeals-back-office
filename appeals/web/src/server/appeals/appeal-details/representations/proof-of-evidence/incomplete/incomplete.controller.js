import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';
import { appealShortReference } from '#lib/appeals-formatter.js';
import { renderCheckYourAnswersComponent } from '#lib/mappers/components/page-components/check-your-answers.js';
import { simpleHtmlComponent } from '#lib/mappers/index.js';
import { buildHtmlList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { addNotificationBannerToSession } from '#lib/session-utilities.js';
import { preserveQueryString } from '#lib/url-utilities.js';
import {
	prepareRejectionReasons,
	rejectionReasonHtml
} from '../../common/components/reject-reasons.js';
import { mapRejectionReasonOptionsToCheckboxItemParameters } from '../../common/render-select-rejection-reasons.js';
import { mapRejectionReasonPayload } from '../../representations.mapper.js';
import {
	getRepresentationRejectionReasonOptions,
	representationIncomplete,
	updateRejectionReasons
} from '../../representations.service.js';
import { incompleteProofOfEvidencePage } from './incomplete.mapper.js';

/**
 * @param {string} path
 * @param {string} sessionKey
 * @returns {import('@pins/express/types/express.js').RequestHandler<any>}
 */
export const redirectAndClearSession = (path, sessionKey) => (request, response) => {
	delete request.session[sessionKey];

	response.redirect(preserveQueryString(request, `${request.baseUrl}${path}`));
};

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 **/
export async function renderReasons(request, response) {
	const {
		params: { proofOfEvidenceType, appealId },
		currentAppeal,
		currentRepresentation,
		apiClient,
		session,
		errors
	} = request;

	const incompleteReasons = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const mappedRejectionReasons = mapRejectionReasonOptionsToCheckboxItemParameters(
		currentRepresentation,
		incompleteReasons,
		session,
		['proofOfEvidence', appealId],
		errors
	);

	const pageContent = incompleteProofOfEvidencePage(currentAppeal, proofOfEvidenceType);

	return response.status(400).render('appeals/appeal/reject-representation.njk', {
		errors,
		pageContent,
		rejectionReasons: mappedRejectionReasons
	});
}

/**
 * @param {import('@pins/express/types/express.js').Request} request
 * @param {import('@pins/express/types/express.js').RenderedResponse<any, any, Number>} response
 */
export const postReasons = async (request, response) => {
	const {
		params: { appealId, proofOfEvidenceType },
		errors
	} = request;
	if (errors) {
		return renderReasons(request, response);
	}

	return response
		.status(200)
		.redirect(
			`/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}/incomplete/confirm`
		);
};

/**
 * @type {import('@pins/express').RenderHandler<{}>}
 */
export const renderConfirm = async (
	{
		errors,
		currentAppeal: { appealReference, appealId },
		currentRepresentation,
		session,
		apiClient,
		params: { proofOfEvidenceType }
	},
	response
) => {
	const reasonOptions = await getRepresentationRejectionReasonOptions(
		apiClient,
		currentRepresentation.representationType
	);

	const proofOfEvidence = session.proofOfEvidence[appealId];

	const rejectionReasons = prepareRejectionReasons(
		proofOfEvidence,
		proofOfEvidence.rejectionReason,
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
			title: `Check details and reject ${proofOfEvidenceType} proof of evidence and witnesses`,
			heading: `Check details and reject ${proofOfEvidenceType} proof of evidence and witnesses`,
			preHeading: `Appeal ${appealShortReference(appealReference)}`,
			backLinkUrl: `/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}/incomplete/reasons`,
			submitButtonText: 'Confirm statement is incomplete',
			responses: {
				'Proof of evidence and witnesses': {
					value: !attachmentsList?.length ? 'No documents' : undefined,
					html: attachmentsList?.length ? attachmentsList : undefined,
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}/manage-documents/${folderId}/?backUrl=/proof-of-evidence/${proofOfEvidenceType}/incomplete/confirm`,
							visuallyHiddenText: 'supporting documents'
						}
					}
				},
				'Review decision': {
					value: 'Reject proof of evidence and witnesses',
					actions: {
						Change: {
							href: `/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}`,
							visuallyHiddenText: 'Review decision'
						}
					}
				},
				[`Reason for rejecting the ${proofOfEvidenceType} proof of evidence and witnesses`]: {
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
							href: `/appeals-service/appeal-details/${appealId}/proof-of-evidence/${proofOfEvidenceType}/incomplete/reasons`,
							visuallyHiddenText: 'Incomplete reasons'
						}
					}
				}
			},
			after: [
				simpleHtmlComponent(
					'p',
					{ class: 'govuk-body' },
					`We’ll send an email to the appellant to explain why you rejected their proof of evidence and witnesses`
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
export const postConfirm = async (request, response) => {
	const {
		apiClient,
		params: { appealId, proofOfEvidenceType },
		session,
		currentRepresentation
	} = request;

	const rejectionReasons = mapRejectionReasonPayload(session.proofOfEvidence[appealId]);

	await updateRejectionReasons(
		apiClient,
		appealId,
		String(currentRepresentation.id),
		rejectionReasons
	);

	await representationIncomplete(apiClient, parseInt(appealId), currentRepresentation.id, {
		allowResubmit: session.proofOfEvidence[appealId].setNewDate
	});

	addNotificationBannerToSession({
		session,
		bannerDefinitionKey:
			proofOfEvidenceType === 'lpa'
				? 'lpaProofOfEvidenceIncomplete'
				: 'appellantProofOfEvidenceIncomplete',
		appealId
	});

	return response.status(200).redirect(`/appeals-service/appeal-details/${appealId}`);
};
