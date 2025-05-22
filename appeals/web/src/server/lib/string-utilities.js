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
 * @params {number} [length]
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
