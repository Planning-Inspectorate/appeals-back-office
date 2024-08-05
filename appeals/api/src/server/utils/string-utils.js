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

/**
 * Converts a string from camelCase to SCREAMING_SNAKE format.
 * @param {string} str - The string to convert.
 * @returns {string} - The SCREAMING_SNAKE formatted string.
 */

const camelToScreamingSnake = (str) => {
	return str
		.replace(/\s+/g, '') // Remove all spaces
		.replace(/([a-z])([A-Z])/g, '$1_$2') // Lowercase to Uppercase transitions
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // Uppercase sequence followed by lowercase
		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // Uppercase sequence followed by lowercase (catch-all)
		.toUpperCase(); // Convert the entire string to uppercase
};

export { camelToScreamingSnake };
