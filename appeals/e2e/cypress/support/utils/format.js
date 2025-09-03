/**
 * Removes leading zeros from string number - e.g. '00' becomes '0' and '05' becopmes '5'
 * @param {*} value The value to format
 * @returns
 */
export function formatAsWholeNumber(value) {
	// remove any leading 0 (e.g. from '00' or '05')
	return +value + '';
}

/**
 * Takes an object and returns string concatonation of its values using seperator (e.g.  Line1\nLine2)
 * @param {*} object object containg address fields
 * @param {*} seperator character to use as seperator
 */
export function formatObjectAsString(object, seperator = '') {
	cy.log('** object to format ', JSON.stringify(object));
	const formattedString = Object.keys(object)
		.map((key) => object[key])
		.join(seperator);

	return formattedString;
}
