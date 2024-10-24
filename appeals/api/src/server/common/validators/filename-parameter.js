import { ERROR_INVALID_FILENAME } from '#endpoints/constants.js';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateFileNameParameter = (parameterName) =>
	body(parameterName)
		.optional({ checkFalsy: true })
		.matches('^[a-zA-Z0-9_-]+.[a-zA-Z0-9_-]+$')
		.withMessage(ERROR_INVALID_FILENAME);
