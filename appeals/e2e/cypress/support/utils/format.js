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
 * @param {*} seperator character to use as seperator, defaults as empty string
 */
export function formatObjectAsString(object, seperator = '') {
	cy.log('** object to format ', JSON.stringify(object));
	const formattedString = Object.keys(object)
		.map((key) => object[key])
		.join(seperator);

	return formattedString;
}

/**
 * Takes a date object and returns formatted date and time
 * @param {*} date Date to format
 * @returns formatted date and time
 */
export function formatDateAndTime(date) {
	if (!(date instanceof Date)) {
		throw new Error('Invalid date object');
	}

	// Format date (e.g., "22 May 2025")
	const formattedDate = new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(date);

	// Format time (e.g., "2:31am")
	const formattedTime = new Intl.DateTimeFormat('en-GB', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true
	})
		.format(date)
		.toLowerCase()
		.replace(' ', '');

	return { date: formattedDate, time: formattedTime };
}

/**
 * Gets date and time vales from a Date object
 * @param {*} date a Date to get date and time values from
 */
export function getDateAndTimeValues(date) {
	return {
		day: date.getDate() + '',
		month: date.getMonth() + 1 + '', // month is 0-11
		year: date.getFullYear() + '',
		hours: date.getHours() + '',
		minutes: date.getMinutes() + ''
	};
}
