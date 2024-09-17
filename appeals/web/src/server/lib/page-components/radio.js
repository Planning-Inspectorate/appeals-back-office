/**
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|boolean|null} [params.value]
 * @param {string} [params.legendText]
 * @returns {PageComponent}
 */
export function yesNoInput({ name, id, value, legendText }) {
	/** @type {PageComponent} */
	const component = {
		type: 'radios',
		parameters: {
			name,
			id: id || name,
			items: [
				{
					value: 'yes',
					text: 'Yes',
					checked: Boolean(value)
				},
				{
					value: 'no',
					text: 'No',
					// only show 'No' checked if value is defined
					checked: typeof value !== 'undefined' && !value
				}
			]
		}
	};
	if (legendText) {
		component.parameters.fieldset = {
			legend: {
				text: legendText,
				isPageHeading: false,
				classes: 'govuk-fieldset__legend--l'
			}
		};
	}
	return component;
}
