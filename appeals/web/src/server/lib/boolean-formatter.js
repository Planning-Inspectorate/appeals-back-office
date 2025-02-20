import logger from './logger.js';

/**
 *
 * @param {boolean | null | undefined} boolean
 * @param {string} [defaultText]
 * @returns
 */
export function convertFromBooleanToYesNo(boolean, defaultText) {
	if (boolean !== undefined && boolean !== null) {
		return boolean ? 'Yes' : 'No';
	}
	if (defaultText) {
		return defaultText;
	}
	return null;
}

/**
 *
 * @param {string | null | undefined} string
 * @returns {Boolean}
 */
export function convertFromYesNoToBoolean(string) {
	const lowerString = string?.toLowerCase();
	if (lowerString !== 'yes' && lowerString !== 'no') {
		logger.error('Not valid string');
		throw new Error('Not valid string');
	}
	return lowerString === 'yes' ? true : false;
}

/**
 *
 * @param {string | null | undefined} string
 * @returns {Boolean | null}
 */
export function convertFromYesNoNullToBooleanOrNull(string) {
	const lowerString = string?.toLowerCase();
	if (lowerString !== 'yes' && lowerString !== 'no') {
		return null;
	}
	return lowerString === 'yes' ? true : false;
}
