import logger from './logger.js';

/**
 *
 * @param {boolean | null | undefined} boolean
 * @returns
 */
export function convertFromBooleanToYesNo(boolean) {
	if (boolean !== undefined && boolean !== null) {
		return boolean ? 'Yes' : 'No';
	}
	return null;
}

/**
 *
 * @param {boolean | null | undefined} boolean
 * @param {string} [optionalDetailsIfYes]
 * @returns {string | string[]}
 */
export function convertFromBooleanToYesNoWithOptionalDetails(boolean, optionalDetailsIfYes = '') {
	const yesOrNo = convertFromBooleanToYesNo(boolean);

	if (yesOrNo === 'Yes') {
		return optionalDetailsIfYes.length > 0 ? [yesOrNo, optionalDetailsIfYes] : yesOrNo;
	} else if (yesOrNo === 'No') {
		return yesOrNo;
	}

	return '';
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
