import { ERROR_MUST_BE_NUMBER } from '@pins/appeals/constants/support.js';
import { param } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
const validateIdParameter = (parameterName) =>
	param(parameterName).isInt().withMessage(ERROR_MUST_BE_NUMBER);

export default validateIdParameter;
