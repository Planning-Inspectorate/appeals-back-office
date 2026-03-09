import { kebabCase } from 'lodash-es';

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|null} [params.value]
 * @param {string} [params.label]
 * @param {boolean} [params.isPageHeading]
 * @param {string} [params.classes]
 * @param {string} [params.errorMessage]
 * @returns {PageComponent}
 */
export function textInput({ name, id, value, label, isPageHeading, classes, errorMessage }) {
	/** @type {PageComponent} */
	const component = {
		type: 'input',
		parameters: {
			name,
			id: id || kebabCase(name),
			value,
			classes
		}
	};
	if (label) {
		component.parameters.label = {
			text: label,
			classes: 'govuk-label--l',
			isPageHeading: isPageHeading || false
		};
	}
	if (errorMessage) {
		component.parameters.errorMessage = {
			text: errorMessage
		};
	}
	return component;
}
