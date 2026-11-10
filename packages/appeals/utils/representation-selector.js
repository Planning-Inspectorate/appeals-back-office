import { APPEAL_REPRESENTATION_TYPE } from '../constants/common.js';

export const REPRESENTATION_SELECTOR_ERROR =
	'Including representations requires a non-empty list of valid representation types';

/**
 * @param {unknown} types
 * @returns {types is string[]}
 */
export function isValidRepresentationTypes(types) {
	return (
		Array.isArray(types) &&
		types.length > 0 &&
		types.every((type) => Object.values(APPEAL_REPRESENTATION_TYPE).includes(type))
	);
}
