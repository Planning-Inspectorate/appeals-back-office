import { ERROR_INVALID_EMAIL } from '@pins/appeals/constants/support.js';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @param {boolean} [optional=true]
 * @returns {ValidationChain}
 */
export const validateEmailParameter = (parameterName, optional = true) => {
	/** @type {boolean | { values: 'falsy' }} */
	const options = optional ? { values: 'falsy' } : false;
	return body(parameterName).optional(options).isEmail().withMessage(ERROR_INVALID_EMAIL);
};
