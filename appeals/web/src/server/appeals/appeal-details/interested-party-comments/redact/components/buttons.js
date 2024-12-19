import { wrapComponents, buttonComponent } from '#lib/mappers/index.js';

/** @typedef {import("#appeals/appeal-details/representations/types.js").Representation} Representation */

/** @type {PageComponent[]} */
export const buttons = [
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
	),
	buttonComponent(
		'Continue',
		{ type: 'submit' },
		{
			wrapperHtml: {
				opening: '<div class="govuk-button-group">',
				closing: '</div>'
			}
		}
	)
];

export const wrappedButtons = wrapComponents(buttons, {
	opening: '<div>',
	closing: '</div>'
});
