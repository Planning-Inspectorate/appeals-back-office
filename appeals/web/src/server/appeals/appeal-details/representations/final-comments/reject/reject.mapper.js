import { appealShortReference } from '#lib/appeals-formatter.js';
import { preRenderPageComponents } from '#lib/nunjucks-template-builders/page-component-rendering.js';
import { formatFinalCommentsTypeText } from '../view-and-review/view-and-review.mapper.js';
import {
	rejectionReasonHtml,
	prepareRejectionReasons
} from '#appeals/appeal-details/representations/common/components/reject-reasons.js';
import { getAttachmentList } from '#appeals/appeal-details/representations/common/document-attachment-list.js';

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

	const attachmentsList = getAttachmentList(comment);

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
						value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
						actions: {
							items: [
								...(comment.attachments?.length > 0
									? [
											{
												text: 'Manage',
												href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/manage-documents/${comment.attachments?.[0]?.documentVersion?.document?.folderId}/?backUrl=/final-comments/${finalCommentsType}/reject/confirm`,
												visuallyHiddenText: 'supporting documents'
											}
									  ]
									: []),
								{
									text: 'Add',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/add-document/?backUrl=/final-comments/${finalCommentsType}/reject/confirm`,
									visuallyHiddenText: 'supporting documents'
								}
							]
						}
					},
					{
						key: { text: 'Review decision' },
						value: { text: 'Reject final comments' },
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}?backUrl=/final-comments/${finalCommentsType}/reject/confirm`,
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
							html: '',
							pageComponents: [
								{
									type: 'show-more',
									parameters: {
										html: rejectionReasonHtml(rejectionReasons),
										labelText: 'Read more'
									}
								}
							]
						},
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/reject?backUrl=/final-comments/${finalCommentsType}/reject/confirm`,
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
