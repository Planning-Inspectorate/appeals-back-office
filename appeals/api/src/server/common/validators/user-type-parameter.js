import { ERROR_CANNOT_BE_EMPTY_STRING } from '@pins/appeals/constants/support.js';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

const validUserTypes = ['agent', 'appellant'];
/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateUserType = (parameterName) =>
	body(parameterName)
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.custom((string) => validUserTypes.includes(string))
		.withMessage(`User type must be one of the following: ${validUserTypes}`);
