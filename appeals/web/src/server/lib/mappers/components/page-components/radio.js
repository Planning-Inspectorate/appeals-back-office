import { kebabCase } from 'lodash-es';

/**
 * @typedef {'textarea'} ConditionalTypes
 */

/**
 * @param {RadiosPageComponent} component
 * @param {string} legendText
 * @param {boolean} [isPageHeading=false]
 * @returns
 */
function addFieldsetLegendText(component, legendText, isPageHeading = false, legendTextSize = 'l') {
	component.parameters.fieldset = {
		legend: {
			text: legendText,
			isPageHeading,
			classes: `govuk-fieldset__legend--${legendTextSize}`
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
 * @param {string} [params.legendTextSize]
 * @param {boolean} [params.legendIsPageHeading]
 * @param {ConditionalParams} [params.yesConditional]
 * @param {string} [params.customYesLabel]
 * @param {string} [params.customNoLabel]
 * @param {string|Object} [params.hint]
 * @param {string|undefined|null} [params.errorMessage]
 * @returns {RadiosPageComponent}
 */
export function yesNoInput({
	name,
	id,
	value,
	legendText,
	legendTextSize = 'l',
	legendIsPageHeading = false,
	yesConditional,
	customYesLabel,
	customNoLabel,
	hint,
	errorMessage
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

	/** @type {RadiosPageComponent} */
	const component = {
		type: 'radios',
		parameters: {
			name,
			idPrefix: id || kebabCase(name),
			items: [
				yes,
				{
					value: 'no',
					text: customNoLabel || 'No',
					checked: value === false || value === 'false' || value === 'no'
				}
			],
			errorMessage: errorMessage ? { text: errorMessage } : undefined
		}
	};
	if (legendText) {
		addFieldsetLegendText(component, legendText, legendIsPageHeading, legendTextSize);
	}
	if (typeof hint === 'string') {
		component.parameters.hint = { text: hint };
	} else {
		component.parameters.hint = hint;
	}
	return component;
}

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {RadioItem[]} params.items
 * @param {string} [params.idPrefix]
 * @param {string|null} [params.value]
 * @param {string} [params.legendText]
 * @param {boolean} [params.legendIsPageHeading]
 * @param {string} [params.errorMessage]
 * @returns {PageComponent}
 */
export function radiosInput({
	name,
	items,
	idPrefix,
	value,
	legendText,
	legendIsPageHeading = false,
	errorMessage
}) {
	/** @type {PageComponent} */
	const component = {
		type: 'radios',
		parameters: {
			name,
			idPrefix,
			items,
			value,
			errorMessage: errorMessage ? { text: errorMessage } : undefined
		}
	};
	if (legendText) {
		addFieldsetLegendText(component, legendText, legendIsPageHeading);
	}
	return component;
}
