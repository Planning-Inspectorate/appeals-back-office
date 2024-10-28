/** @type {PageComponent[]} */
export const buttons = [
	{
		type: 'button',
		parameters: {
			text: 'Redact',
			id: 'redact-button',
			classes: 'govuk-button--secondary'
		},
		wrapperHtml: {
			opening: '<div class="govuk-button-group">',
			closing: '</div>'
		}
	},
	{
		type: 'button',
		parameters: {
			text: 'Confirm',
			type: 'submit'
		},
		wrapperHtml: {
			opening: '<div class="govuk-button-group">',
			closing: '</div>'
		}
	}
];
