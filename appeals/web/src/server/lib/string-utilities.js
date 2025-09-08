/**
 * @param {string} str
 * @returns {boolean}
 */
export const stringContainsDigitsOnly = (str) => Boolean(str.trim().match(/^\d+$/));

/**
 * @param {string} str
 * @returns {string}
 */
export const capitalizeFirstLetter = (str) => {
	if (str.length > 1) {
		return str.charAt(0)?.toUpperCase() + str.slice(1);
	}

	return str.toUpperCase();
};

/**
 * @param {string} str
 * @returns {string}
 */
export const uncapitalizeFirstLetter = (str) => {
	if (str.length > 1) {
		return str.charAt(0)?.toLowerCase() + str.slice(1);
	}

	return str.toLowerCase();
};

/**
 * Pad a number with leading zeros
 *
 * @param {number | string} num
 * @param {number} [length]
 * @returns {string}
 */
export const padNumberWithZero = (num, length = 2) => num.toString().padStart(length, '0');

/**
 * Convert a snake-case string to the equivalent string with hyphens replaced by spaces
 *
 * @param {string} str snake-case input string (eg. `my-test-string`)
 * @returns {string} space-separated output string (eg. `my test string`)
 */
export const snakeCaseToSpaceSeparated = (str) => str.replaceAll('-', ' ');

/**
 *
 * @param {string} s
 * @returns
 */
export const camelCaseToWords = (s) => {
	const result = s.replace(/([A-Z])/g, ' $1');
	return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Converts a string to camelCase format.
 * Handles spaces, underscores, hyphens, and any non-alphanumeric separator.
 * @param {string} str - The string to convert.
 * @returns {string} - The camelCase formatted string.
 */
export const toCamelCase = (str) => {
	return str
		.trim()
		.toLowerCase()
		.split(/[^a-zA-Z0-9]+/) // split on any non-alphanumeric character
		.map((word, idx) => (idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
		.join('');
};

/**
 * Converts a string to sentence case.
 * @param {string} str - The string to convert.
 * @returns {string} - The sentence case formatted string.
 */
export const toSentenceCase = (str) => {
	if (!str) {
		return '';
	}
	return capitalizeFirstLetter(camelCaseToWords(toCamelCase(str)).toLowerCase());
};
