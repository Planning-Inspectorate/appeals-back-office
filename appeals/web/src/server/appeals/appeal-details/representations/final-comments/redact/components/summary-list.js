/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

import { checkRedactedText } from '#lib/validators/redacted-text.validator.js';

/**
 * @param {Appeal} appealDetails
 * @param {Representation} comment
 * @param {string} finalCommentsType
 * @param {string|null} attachmentsList
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageComponent}
 */
export const summaryList = (
	appealDetails,
	comment,
	finalCommentsType,
	attachmentsList,
	session
) => {
	const displayRedactedComment = checkRedactedText(
		comment.originalRepresentation,
		session?.redactedRepresentation
	);
	return {
		type: 'summary-list',
		wrapperHtml: {
			opening: '<div class="govuk-grid-row"><div class="govuk-grid-column-full">',
			closing: '</div></div>'
		},
		parameters: {
			rows: [
				{
					key: { text: displayRedactedComment ? 'Original final comments' : 'Comment' },
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
				...(displayRedactedComment
					? [
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
							}
					  ]
					: []),
				{
					key: { text: 'Supporting documents' },
					value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' }
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
	};
};
