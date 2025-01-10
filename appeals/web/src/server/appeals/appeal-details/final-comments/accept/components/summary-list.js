/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, finalCommentsType) => ({
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
				value: { text: '' }
			},
			{
				key: { text: 'Review decisions' },
				value: { text: 'Accept final comments' },
				actions: {
					items: [
						{
							text: 'Change',
							href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`
						}
					]
				}
			}
		]
	}
});
