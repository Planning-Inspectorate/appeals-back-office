/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageComponent}
 */
export const summaryList = (appealDetails, comment, session) => ({
	type: 'summary-list',
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
							href: `/appeals-service/appeal-details/${appealDetails.appealId}/interested-party-comments/${comment.id}/redact`,
							text: 'Change'
						}
					]
				}
			}
		]
	}
});
