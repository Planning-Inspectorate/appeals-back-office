import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { formatFinalCommentsTypeText } from '../view-and-review/view-and-review.mapper.js';
import {
	rejectionReasonHtml,
	prepareRejectionReasons
} from '#appeals/appeal-details/representations/common/components/reject-reasons.js';
import { buildHtmUnorderedList } from '#lib/nunjucks-template-builders/tag-builders.js';
import { mapDocumentDownloadUrl } from '#appeals/appeal-documents/appeal-documents.mapper.js';

/**
 * @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal
 * @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation
 * @typedef {import('@pins/appeals.api').Appeals.ReasonOption} ReasonOption
 */

/**
 * @param {Appeal} appealDetails
 * @param {string} finalCommentsType
 * @returns {PageContent}
 */
export function rejectFinalCommentsPage(appealDetails, finalCommentsType) {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const pageContent = {
		heading: `Why are you rejecting the ${formatFinalCommentsTypeText(
			finalCommentsType
		)}'s final comments?`,
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
		preHeading: `Appeal ${shortReference}`,
		hint: 'Select all that apply.'
	};

	return pageContent;
}

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {import('@pins/express').Session} session
 * @param {ReasonOption[]} reasonOptions
 * @returns {PageContent}
 */
export const confirmRejectFinalCommentPage = (
	appealDetails,
	comment,
	finalCommentsType,
	session,
	reasonOptions
) => {
	const shortReference = appealShortReference(appealDetails.appealReference);

	const attachmentsList =
		comment.attachments.length > 0
			? buildHtmUnorderedList(
					comment.attachments.map(
						(a) =>
							`<a class="govuk-link" href="${mapDocumentDownloadUrl(
								a.documentVersion.document.caseId,
								a.documentVersion.document.guid,
								a.documentVersion.document.name
							)}" target="_blank">${a.documentVersion.document.name}</a>`
					)
			  )
			: null;

	const rejectionReasons = prepareRejectionReasons(
		session.rejectFinalComments,
		session.rejectFinalComments.rejectionReason,
		reasonOptions
	);

	/** @type {PageComponent[]} */
	const pageComponents = [
		{
			type: 'summary-list',
			wrapperHtml: {
				opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
				closing: '</div></div>'
			},
			parameters: {
				rows: [
					{
						key: { text: 'Final comments' },
						value: {
							html: '',
							pageComponents: [
								{
									type: 'show-more',
									parameters: {
										text: comment.originalRepresentation,
										labelText: 'Read more'
									}
								}
							]
						}
					},
					{
						key: { text: 'Supporting documents' },
						value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' }
					},
					{
						key: { text: 'Review decision' },
						value: { text: 'Reject final comments' },
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
									text: 'Change',
									visuallyHiddenText: 'review decision'
								}
							]
						}
					},
					{
						key: {
							text: `Why are you rejecting the ${formatFinalCommentsTypeText(
								finalCommentsType
							)}'s final comments?`
						},
						value: {
							html: rejectionReasonHtml(rejectionReasons)
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/reject`,
									text: 'Change',
									visuallyHiddenText: 'rejections reasons'
								}
							]
						}
					}
				]
			}
		}
	];

	preRenderPageComponents(pageComponents);

	/** @type {PageContent} */
	const pageContent = {
		title: 'Confirm rejection',
		backLinkUrl: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/reject`,
		preHeading: `Appeal ${shortReference}`,
		heading: `Check details and reject ${formatFinalCommentsTypeText(
			finalCommentsType
		)} final comments`,
		forceRenderSubmitButton: true,
		submitButtonText: `Reject ${formatFinalCommentsTypeText(finalCommentsType)} final comments`,
		pageComponents
	};

	return pageContent;
};
