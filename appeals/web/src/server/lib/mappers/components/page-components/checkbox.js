/**
 * @param {Object} params
 * @param {string} params.name
 * @param {CheckboxItemsProperties[]} params.items
 * @param {string} [params.idPrefix]
 * @param {string} [params.legendText]
 * @param {boolean} [params.legendIsPageHeading]
 * @returns {PageComponent}
 */
export function checkboxesInput({
	name,
	items,
	idPrefix,
	legendText,
	legendIsPageHeading = false
}) {
	/** @type {PageComponent} */
	const component = {
		type: 'checkboxes',
		parameters: {
			name,
			idPrefix,
			items
		}
	};
	if (legendText) {
		component.parameters.fieldset = {
			legend: {
				text: legendText,
				isPageHeading: legendIsPageHeading,
				classes: 'govuk-fieldset__legend--l'
			}
		};
	}
	return component;
}
