import { kebabCase } from 'lodash-es';

/**
 * @typedef {import('#appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.id]
 * @param {string} [params.namePrefix]
 * @param {DayMonthYearHourMinute|null} [params.value]
 * @param {string} [params.legendText]
 * @returns {PageComponent}
 */
export function dateInput({ name, id, namePrefix, value, legendText }) {
	const formattedNamePrefix = namePrefix ? `${namePrefix}-` : '';

	/** @type {PageComponent} */
	const component = {
		type: 'date-input',
		parameters: {
			id: id || kebabCase(name),
			items: [
				{
					label: 'Day',
					name: `${formattedNamePrefix}day`,
					classes: 'govuk-input--width-2',
					value: value?.day
				},
				{
					label: 'Month',
					name: `${formattedNamePrefix}month`,
					classes: 'govuk-input--width-2',
					value: value?.month
				},
				{
					label: 'Year',
					name: `${formattedNamePrefix}year`,
					classes: 'govuk-input--width-4',
					value: value?.year
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