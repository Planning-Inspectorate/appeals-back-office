import { kebabCase } from 'lodash-es';

/**
 * @typedef {'textarea'} ConditionalTypes
 */

/**
 * @param {RadiosPageComponent} component
 * @param {string} legendText
 * @returns
 */
function addFieldsetLegendText(component, legendText) {
	component.parameters.fieldset = {
		legend: {
			text: legendText,
			isPageHeading: false,
			classes: 'govuk-fieldset__legend--l'
		}
	};
}

/**
 *
 * @param {string} id
 * @param {string} name
 * @param {string} hint
 * @param {string|undefined} details
 * @param {ConditionalTypes} [type]
 * @returns {{html: string}}
 */
export function conditionalFormatter(id, name, hint, details, type = 'textarea') {
	let conditionalInputHtml = {
		textarea: `<textarea class="govuk-textarea" id="${id}" name="${name}" rows="3">${details}</textarea>`
		//TODO: Conditionals => add any new types here
	};
	return {
		html: `<div class="govuk-form-group">
		<label class="govuk-label" for="${id}">
			${hint}
		</label>
		${conditionalInputHtml[type]}
	  </div>`
	};
}

/**
 * @typedef {Object} ConditionalParams
 * @property {string} id
 * @property {string} name
 * @property {string} hint
 * @property {string} [details]
 * @property {ConditionalTypes} [type]
 */

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|boolean|null} [params.value]
 * @param {string} [params.legendText]
 * @param {ConditionalParams} [params.yesConditional]
 * @param {string} [params.customYesLabel]
 * @param {string} [params.customNoLabel]
 * @returns {PageComponent}
 */
export function yesNoInput({
	name,
	id,
	value,
	legendText,
	yesConditional,
	customYesLabel,
	customNoLabel
}) {
	/** @type {RadioItem} */
	const yes = {
		value: 'yes',
		text: customYesLabel || 'Yes',
		checked: value === true || value === 'true' || value === 'yes'
	};
	if (yesConditional) {
		yes.conditional = conditionalFormatter(
			yesConditional.id,
			yesConditional.name,
			yesConditional.hint,
			yesConditional.details,
			yesConditional.type
		);
	}

	/** @type {PageComponent} */
	const component = {
		type: 'radios',
		parameters: {
			name,
			id: id || kebabCase(name),
			items: [
				yes,
				{
					value: 'no',
					text: customNoLabel || 'No',
					checked: value === false || value === 'false' || value === 'no'
				}
			]
		}
	};
	if (legendText) {
		addFieldsetLegendText(component, legendText);
	}
	return component;
}

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {RadioItem[]} params.items
 * @param {string} [params.id]
 * @param {string|null} [params.value]
 * @param {string} [params.legendText]
 * @returns {PageComponent}
 */
export function radiosInput({ name, items, id, value, legendText }) {
	/** @type {PageComponent} */
	const component = {
		type: 'radios',
		parameters: {
			name,
			id: id || kebabCase(name),
			items,
			value
		}
	};
	if (legendText) {
		addFieldsetLegendText(component, legendText);
	}
	return component;
}
