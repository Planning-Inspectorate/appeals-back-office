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
		// Filename must only contain alphanumeric characters, underscores, hyphens and one period followed by a suffix
		.matches('^[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+$')
		.withMessage(ERROR_INVALID_FILENAME);
