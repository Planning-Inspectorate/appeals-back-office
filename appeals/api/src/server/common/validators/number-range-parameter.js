import { body } from 'express-validator';
import { ERROR_NUMBER_RANGE } from '#endpoints/constants.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @param {number} min
 * @param {number} max
 * @returns {ValidationChain}
 */
export const validateNumberRangeParameter = (parameterName, min, max) => {
	return body(parameterName)
		.isInt({ min, max })
		.withMessage(() => stringTokenReplacement(ERROR_NUMBER_RANGE, [min.toString(), max.toString()]))
		.toInt();
};

export default validateNumberRangeParameter;
