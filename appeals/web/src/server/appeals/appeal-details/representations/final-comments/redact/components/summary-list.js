/** @typedef {import("#appeals/appeal-details/appeal-details.types.js").WebAppeal} Appeal */
/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

import { newLine2LineBreak } from '#lib/string-utilities.js';
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
									html: newLine2LineBreak(comment.originalRepresentation),
									labelText: 'Read more'
								}
							}
						]
					},
					...(!displayRedactedComment && {
						actions: {
							items: [
								{
									href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/redact`,
									text: 'Redact',
									visuallyHiddenText: 'Redact statement'
								}
							]
						}
					})
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
												html: newLine2LineBreak(session?.redactedRepresentation),
												labelText: 'Read more'
											}
										}
									]
								},
								actions: {
									items: [
										{
											href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/redact?backUrl=/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/redact/confirm`,
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
					value: attachmentsList ? { html: attachmentsList } : { text: 'No documents' },
					actions: {
						items: [
							...(comment.attachments?.length > 0
								? [
										{
											text: 'Manage',
											href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/manage-documents/${comment.attachments?.[0]?.documentVersion?.document?.folderId}/?backUrl=/final-comments/${finalCommentsType}/redact/confirm`,
											visuallyHiddenText: 'supporting documents'
										}
								  ]
								: []),
							{
								text: 'Add',
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/add-document/?backUrl=/final-comments/${finalCommentsType}/redact/confirm`,
								visuallyHiddenText: 'supporting documents'
							}
						]
					}
				},
				{
					key: { text: 'Review decision' },
					value: { text: 'Redact and accept final comments' },
					actions: {
						items: [
							{
								href: `/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}?backUrl=/appeals-service/appeal-details/${appealDetails.appealId}/final-comments/${finalCommentsType}/redact/confirm`,
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
