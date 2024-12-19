import { textareaInput } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

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
		labelText: 'Redacted comment',
		labelClasses: 'govuk-label--s',
		value:
			session?.redactedRepresentation ||
			comment.redactedRepresentation ||
			comment.originalRepresentation
	})
];
