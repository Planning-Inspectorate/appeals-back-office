import { ERROR_INVALID_EMAIL } from '#endpoints/constants.js';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateEmailParameter = (parameterName) =>
	body(parameterName).optional({ checkFalsy: true }).isEmail().withMessage(ERROR_INVALID_EMAIL);
