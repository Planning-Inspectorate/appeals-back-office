/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, finalCommentsType, session) => ({
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
				key: { text: 'Redacted final comments' },
				value: {
					html: '',
					pageComponents: [
						{
							type: 'show-more',
							parameters: {
								text: session?.redactedRepresentation,
								labelText: 'Read more'
							}
						}
					]
				},
				actions: {
					items: [
						{
							href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/redact`,
							text: 'Change',
							visuallyHiddenText: 'redacted final comments'
						}
					]
				}
			},
			{
				key: { text: 'Supporting documents' },
				value: { text: '' } // TODO: blocked by A2-1765 (need a way to add documents for testing)
			},
			{
				key: { text: 'Review decision' },
				value: { text: 'Redact and accept final comments' },
				actions: {
					items: [
						{
							href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}`,
							text: 'Change',
							visuallyHiddenText: 'review decision'
						}
					]
				}
			}
		]
	}
});
