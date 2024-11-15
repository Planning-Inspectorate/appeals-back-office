import { body } from 'express-validator';
import { ERROR_CANNOT_BE_EMPTY_STRING, ERROR_MUST_BE_NUMBER } from '#endpoints/constants.js';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateNumberParameter = (parameterName) =>
	body(parameterName).optional().isInt().withMessage(ERROR_MUST_BE_NUMBER).toInt();

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateRequiredNumberParameter = (parameterName) =>
	body(parameterName)
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.isInt()
		.withMessage(ERROR_MUST_BE_NUMBER)
		.toInt();

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateDecimalParameter = (parameterName) =>
	body(parameterName).optional().isFloat().withMessage(ERROR_MUST_BE_NUMBER).toFloat();

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
export const validateRequiredDecimalParameter = (parameterName) =>
	body(parameterName)
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.isFloat()
		.withMessage(ERROR_MUST_BE_NUMBER)
		.toFloat();
