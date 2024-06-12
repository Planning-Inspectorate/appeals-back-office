/**
 * Converts a string to camelCase format.
 * @param {string} str - The string to convert.
 * @returns {string} - The camelCase formatted string.
 */
const toCamelCase = (str) => {
	return str
		.toLowerCase()
		.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
			index === 0 ? match.toLowerCase() : match.toUpperCase()
		)
		.replace(/\s+/g, '');
};

export { toCamelCase };
