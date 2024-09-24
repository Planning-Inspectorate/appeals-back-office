import { conditionalFormatter } from '#lib/mappers/global-mapper-formatter.js';
import { kebabCase } from 'lodash-es';

/**
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|boolean|null} [params.value]
 * @param {string} [params.legendText]
 * @param {import('../mappers/global-mapper-formatter.js').ConditionalParams} [params.yesConditional]
 * @returns {PageComponent}
 */
export function yesNoInput({ name, id, value, legendText, yesConditional }) {
	/** @type {RadioItem} */
	const yes = {
		value: 'yes',
		text: 'Yes',
		checked: Boolean(value)
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
