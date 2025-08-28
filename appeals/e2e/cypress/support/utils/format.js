/**
 * Removes leading zeros from string number - e.g. '00' becomes '0' and '05' becopmes '5'
 * @param {*} value The value to format
 * @returns
 */
export function formatAsWholeNumber(value) {
	// remove any leading 0 (e.g. from '00' or '05')
	return +value + '';
}
