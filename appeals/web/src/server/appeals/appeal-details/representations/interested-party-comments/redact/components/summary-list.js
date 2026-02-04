/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

import { getAttachmentList } from '#appeals/appeal-details/representations/common/document-attachment-list.js';
import { editLink } from '#lib/edit-utilities.js';

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @param {boolean} [redactMatching]
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, session, redactMatching) => {
	const attachmentsList = getAttachmentList(comment);

	const folderId = comment.attachments?.[0]?.documentVersion?.document?.folderId ?? null;
	const baseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}`;
	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			rows: [
				{
					key: { text: 'Interested party' },
					value: { text: comment.author }
				},
				...(redactMatching
					? [
							{
								key: { text: 'Original comment' },
								value: { text: comment.originalRepresentation }
							},
							{
								key: { text: 'Redacted comment' },
								value: { text: session?.redactedRepresentation },
								actions: {
									items: [
										{
											text: 'Change',
											href: editLink(
												`/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/redact`
											),
											visuallyHiddenText: 'redacted comment'
										}
									]
								}
							}
						]
					: [
							{
								key: { text: 'Comment' },
								value: { text: comment.originalRepresentation },
								actions: {
									items: [
										{
											text: 'Redact',
											href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/redact`,
											visuallyHiddenText: 'redacted comment'
										}
									]
								}
							}
						]),
				{
					key: { text: 'Supporting documents' },
					value: attachmentsList ? { html: attachmentsList } : { text: 'Not provided' },
					actions: {
						items: [
							...(comment.attachments?.length > 0
								? [
										{
											text: 'Manage',
											href: `${baseUrl}/manage-documents/${folderId}?backUrl=/interested-party-comments/${comment.id}/redact/confirm`,
											visuallyHiddenText: 'supporting documents'
										}
									]
								: []),
							{
								text: 'Add',
								href: `${baseUrl}/add-document?backUrl=/interested-party-comments/${comment.id}/redact/confirm`,
								visuallyHiddenText: 'supporting documents'
							}
						]
					}
				}
			]
		}
	};
};
