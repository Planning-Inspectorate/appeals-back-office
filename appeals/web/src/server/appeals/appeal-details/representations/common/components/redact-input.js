import { textareaInput } from '#lib/mappers/index.js';
import { wrapComponents, buttonComponent } from '#lib/mappers/index.js';
import { REVERT_BUTTON_TEXT } from '@pins/appeals/constants/common.js';

/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/**
 * @param {Object} params
 * @param {Representation} params.representation
 * @param {string} [params.labelText]
 * @param {import('express-session').Session & Record<string, string>} [params.session]
 * @param {string} [params.redactedRepresentation]
 * @param {string} [params.buttonText]
 * @returns {PageComponent[]}
 */
export const redactInput = ({
	representation,
	labelText,
	session,
	redactedRepresentation,
	buttonText
}) => [
	wrapComponents(
		[
			buttonComponent(buttonText || REVERT_BUTTON_TEXT.DEFAULT_TEXT, {
				id: 'revert-button',
				classes: 'govuk-button--secondary'
			})
		],
		{
			opening: '<div class="govuk-button-group">',
			closing: '</div>'
		}
	),
	textareaInput({
		name: 'redactedRepresentation',
		id: 'redact-textarea',
		readonly: true,
		labelText: labelText || 'Redacted representation',
		labelClasses: 'govuk-label--s',
		value:
			redactedRepresentation ||
			session?.redactedRepresentation ||
			representation.redactedRepresentation ||
			representation.originalRepresentation
	}),
	wrapComponents(
		[
			buttonComponent('Redact selected text', {
				id: 'redact-button',
				classes: 'govuk-button--secondary'
			}),
			buttonComponent('Undo changes', {
				id: 'undo-button',
				classes: 'govuk-button--secondary'
			})
		],
		{
			opening: '<div class="govuk-button-group">',
			closing:
				'</div>' +
				'<p class="govuk-visually-hidden" id="saved-textarea">' +
				(!representation.redactedRepresentation || representation.redactedRepresentation === ''
					? representation.originalRepresentation
					: representation.redactedRepresentation) +
				' </p> '
		}
	)
];
