/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {string|null} attachmentsList
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, finalCommentsType, attachmentsList) => ({
	type: 'summary-list',
	wrapperHtml: {
		opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
		closing: '</div></div>'
	},
	parameters: {
		rows: [
			{
				key: { text: 'Original final comments' },
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
				...(comment.attachments?.length > 0
					? {
							actions: {
								items: [
									{
										text: 'Change',
										href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/manage-documents/${comment.attachments?.[0]?.documentVersion?.document?.folderId}`
									}
								]
							}
					  }
					: {})
			},
			{
				key: { text: 'Review decisions' },
				value: { text: 'Accept final comments' },
				actions: {
					items: [
						{
							text: 'Change',
							href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/`
						}
					]
				}
			}
		]
	}
});
