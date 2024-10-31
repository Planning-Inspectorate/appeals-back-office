import { conditionalFormatter } from '#lib/mappers/global-mapper-formatter.js';
import { kebabCase } from 'lodash-es';

/**
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string|boolean|null} [params.value]
 * @param {string} [params.legendText]
 * @param {import('../global-mapper-formatter.js').ConditionalParams} [params.yesConditional]
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
		checked: (value === true || value === 'true' || value === 'yes')
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
					checked: (value === false || value === 'false' || value === 'no')
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
