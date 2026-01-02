import { join, map, pick } from 'lodash-es';

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

/**
 * @param {string} str
 * @returns {string}
 * */
function capitalizeFirstLetter(str) {
	if (str.length > 1) {
		return str.charAt(0)?.toUpperCase() + str.slice(1);
	}

	return str.toUpperCase();
}

/**
 * @param {string} appealType
 * @returns {string}
 */
const trimAppealType = (appealType) => {
	return appealType.endsWith(' appeal') ? appealType.replace(' appeal', '') : appealType;
};

/**
 * converts a multi part address to a single string
 * @typedef {import('@pins/appeals.api').Schema.Address} Address
 *
 * @param {import('@pins/appeals.api').Schema.Address} address
 * @param {string} [separator] the separator to use between address parts (default is ', ')
 * @returns {string}
 */
const addressToString = (address, separator = ', ') => {
	return join(
		map(
			pick(address, ['addressLine1', 'addressLine2', 'addressTown', 'addressCounty', 'postcode']),
			(value) => {
				return value?.trim();
			}
		).filter((value) => value?.length),
		separator
	);
};

export { addressToString, camelToScreamingSnake, capitalizeFirstLetter, trimAppealType };
