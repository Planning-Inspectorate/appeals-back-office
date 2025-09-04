/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

import { newLine2LineBreak } from '#lib/string-utilities.js';

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {string|null} attachmentsList
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, finalCommentsType, attachmentsList) => {
	const rows = [];

	if (comment.originalRepresentation) {
		rows.push({
			key: { text: 'Original final comments' },
			value: {
				html: '',
				pageComponents: [
					{
						type: 'show-more',
						parameters: {
							html: newLine2LineBreak(comment.originalRepresentation),
							labelText: 'Read more'
						}
					}
				]
			},
			actions: {
				items: [
					{
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/redact?backUrl=/final-comments/${finalCommentsType}/accept`,
						text: 'Redact',
						visuallyHiddenText: 'Redact statement'
					}
				]
			}
		});
	}

	rows.push(
		{
			key: { text: 'Supporting documents' },
			value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
			actions: {
				items: [
					...(comment.attachments?.length > 0
						? [
								{
									text: 'Manage',
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/manage-documents/${comment.attachments?.[0]?.documentVersion?.document?.folderId}/?backUrl=/final-comments/${finalCommentsType}/accept`,
									visuallyHiddenText: 'supporting documents'
								}
						  ]
						: []),
					{
						text: 'Add',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/add-document/?backUrl=/final-comments/${finalCommentsType}/accept`,
						visuallyHiddenText: 'supporting documents'
					}
				]
			}
		},
		{
			key: { text: 'Review decisions' },
			value: { text: 'Accept final comments' },
			actions: {
				items: [
					{
						text: 'Change',
						href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}?backUrl=/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/accept`
					}
				]
			}
		}
	);

	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			rows
		}
	};
};
