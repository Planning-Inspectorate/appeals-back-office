import { textareaInput } from '#lib/mappers/index.js';
import { wrapComponents, buttonComponent } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Object} params
 * @param {Representation} params.comment
 * @param {string} [params.labelText]
 * @param {import('express-session').Session & Record<string, string>} [params.session]
 * @returns {PageComponent[]}
 */
export const redactInput = ({ comment, labelText, session }) => [
	textareaInput({
		name: 'redactedRepresentation',
		id: 'redact-textarea',
		readonly: true,
		labelText: labelText || 'Redacted representation',
		labelClasses: 'govuk-label--s',
		value:
			session?.redactedRepresentation ||
			comment.redactedRepresentation ||
			comment.originalRepresentation
	}),
	wrapComponents(
		[
			buttonComponent('Redact selected text', {
				id: 'redact-button',
				classes: 'govuk-button--secondary'
			}),
			buttonComponent('Undo all changes', {
				id: 'undo-button',
				classes: 'govuk-button--secondary'
			})
		],
		{
			opening: '<div class="govuk-button-group">',
			closing: '</div>'
		}
	)
];