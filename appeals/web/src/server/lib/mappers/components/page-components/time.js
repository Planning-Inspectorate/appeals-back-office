/**
 * @typedef {import('#appeals/appeals.types.js').DayMonthYearHourMinute} DayMonthYearHourMinute
 */

/**
 *
 * @param {Object} params
 * @param {string} [params.id]
 * @param {DayMonthYearHourMinute|null} [params.value]
 * @param {string} [params.legendText]
 * @param {boolean} [params.legendIsPageHeading=false]
 * @param {string} [params.legendClasses]
 * @param {string} [params.hint]
 * @param {boolean} [params.showLabels=true]
 * @param {string} [params.fieldsetClasses]
 * @param {string} [params.errorMessage]
 * @returns {PageComponent}
 */
export function timeInput({
	id,
	value,
	legendText,
	legendIsPageHeading = false,
	legendClasses = 'govuk-fieldset__legend--m',
	hint,
	showLabels = true,
	fieldsetClasses,
	errorMessage
}) {
	/** @type {PageComponent} */
	return {
		type: 'time-input',
		parameters: {
			id,
			fieldset: {
				legend: {
					text: legendText,
					classes: legendClasses,
					isPageHeading: legendIsPageHeading
				},
				...(fieldsetClasses && { classes: fieldsetClasses })
			},
			showLabels,
			...(hint && { hint: { text: hint } }),
			hour: {
				value: value?.hour
			},
			minute: {
				value: value?.minute
			},
			errorMessage: errorMessage
		}
	};
}
