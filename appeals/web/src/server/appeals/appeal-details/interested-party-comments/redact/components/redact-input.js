import { textareaInput } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/interested-party-comments/interested-party-comments.types.js").Representation} Representation */

/**
 * @param {Representation} comment
 * @param {import('express-session').Session & Record<string, string>} [session]
 * @returns {PageComponent[]}
 */
export const redactInput = (comment, session) => [
	textareaInput({
		name: 'redactedRepresentation',
		id: 'redact-textarea',
		readonly: true,
		label: {
			text: 'Redacted comment',
			classes: 'govuk-label--s'
		},
		value:
			session?.redactedRepresentation ||
			comment.redactedRepresentation ||
			comment.originalRepresentation
	})
];
