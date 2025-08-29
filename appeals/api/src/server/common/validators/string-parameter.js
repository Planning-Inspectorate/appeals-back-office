import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_MAX_LENGTH_CHARACTERS,
	ERROR_MUST_BE_STRING,
	LENGTH_1000,
	LENGTH_300
} from '@pins/appeals/constants/support.js';
import { body } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @param {number} maxLength
 * @returns {ValidationChain}
 */
export const validateStringParameter = (parameterName, maxLength = LENGTH_300) =>
	body(parameterName)
		.optional()
		.isString()
		.withMessage(ERROR_MUST_BE_STRING)
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.isLength({ max: maxLength })
		.withMessage(stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [maxLength]));

/**
 * @param {string} parameterName
 * @param {number} maxLength
 * @returns {ValidationChain}
 */
export const validateTextAreaParameter = (parameterName, maxLength = LENGTH_1000) =>
	body(parameterName)
		.optional()
		.isString()
		.withMessage(ERROR_MUST_BE_STRING)
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.isLength({ max: maxLength })
		.withMessage(stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [maxLength]));

/**
 * @param {string} parameterName
 * @param {number} maxLength
 * @returns {ValidationChain}
 */
export const validateOptionalTextAreaParameter = (parameterName, maxLength = LENGTH_1000) =>
	body(parameterName)
		.optional()
		.isString()
		.withMessage(ERROR_MUST_BE_STRING)
		.isLength({ max: maxLength })
		.withMessage(stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [maxLength]));

/**
 * @param {string} parameterName
 * @param {number} maxLength
 * @returns {ValidationChain}
 */
export const validateStringParameterAllowingEmpty = (parameterName, maxLength = LENGTH_300) =>
	body(parameterName)
		.optional({ nullable: true })
		.isString()
		.withMessage(ERROR_MUST_BE_STRING)
		.isLength({ max: maxLength })
		.withMessage(stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [maxLength]));

/**
 * @param {string} parameterName
 * @param {number} maxLength
 * @param {string | null} parentKeyIsOptional
 * @returns {ValidationChain}
 */
export const validateRequiredStringParameter = (
	parameterName,
	maxLength = LENGTH_300,
	parentKeyIsOptional = null
) => {
	const chain = body(parameterName);

	if (parentKeyIsOptional) {
		chain.if(body(parentKeyIsOptional).exists({ values: 'null' }));
	}

	return chain

		.isString()
		.withMessage(ERROR_MUST_BE_STRING)
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.isLength({ max: maxLength })
		.withMessage(stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [maxLength]));
};

/**
 * @param {string} parameterName
 * @param {number} maxLength
 * @returns {ValidationChain}
 */
export const validateNullableTextAreaParameter = (parameterName, maxLength = LENGTH_1000) =>
	body(parameterName)
		.optional({ nullable: true })
		.custom((value) => {
			if (value === null) return true;
			if (typeof value !== 'string') throw new Error(ERROR_MUST_BE_STRING);
			if (value.length === 0) throw new Error(ERROR_CANNOT_BE_EMPTY_STRING);
			if (value.length > maxLength)
				throw new Error(stringTokenReplacement(ERROR_MAX_LENGTH_CHARACTERS, [maxLength]));
			return true;
		});
