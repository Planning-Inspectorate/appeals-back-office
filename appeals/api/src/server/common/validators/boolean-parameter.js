import { ERROR_MUST_BE_BOOLEAN } from '@pins/appeals/constants/support.js';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateBooleanParameter = (parameterName) =>
	body(parameterName)
		.optional()
		.isBoolean()
		.withMessage(ERROR_MUST_BE_BOOLEAN)
		.customSanitizer((value) => (['false', '0'].includes(value) ? false : !!value));

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateRequiredBooleanParameter = (parameterName) =>
	body(parameterName)
		.isBoolean()
		.withMessage(ERROR_MUST_BE_BOOLEAN)
		.customSanitizer((value) => (['false', '0'].includes(value) ? false : !!value));
