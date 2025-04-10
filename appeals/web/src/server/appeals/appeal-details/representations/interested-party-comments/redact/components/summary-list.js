/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

import { getAttachmentList } from '#appeals/appeal-details/representations/common/document-attachment-list.js';

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, session) => {
	const attachmentsList = getAttachmentList(comment);

	const folderId = comment.attachments?.[0]?.documentVersion?.document?.folderId ?? null;
	const baseUrl = `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}`;

	/** @type {PageComponent} */
	const pageComponents = {
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
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/redact`,
								visuallyHiddenText: 'redacted comment'
							}
						]
					}
				},
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

	return pageComponents;
};
