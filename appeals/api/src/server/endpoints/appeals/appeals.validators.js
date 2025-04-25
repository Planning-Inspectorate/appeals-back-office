import { composeMiddleware } from '@pins/express';
import { query } from 'express-validator';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_LENGTH_BETWEEN_MIN_AND_MAX_CHARACTERS,
	ERROR_MUST_BE_GREATER_THAN_ZERO,
	ERROR_MUST_BE_NUMBER,
	ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED
} from '@pins/appeals/constants/support.js';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */
/** @typedef {import('express').Request} Request */

/**
 * @param {string} value
 * @returns {boolean}
 */
const hasValue = (value) => !!value;

/**
 * @param {string} value
 * @returns {boolean}
 */
const isGreaterThanZero = (value) => Number(value) >= 1;

/**
 * @param {string} pageNumber
 * @param {string} pageSize
 * @returns {boolean}
 */
const hasPageNumberAndPageSize = (pageNumber, pageSize) => !!(pageNumber && pageSize);

/**
 * @param {string} parameterName
 * @returns {ValidationChain}
 */
const validatePaginationParameter = (parameterName) =>
	query(parameterName)
		.if(hasValue)
		.isInt()
		.withMessage(ERROR_MUST_BE_NUMBER)
		.custom(isGreaterThanZero)
		.withMessage(ERROR_MUST_BE_GREATER_THAN_ZERO)
		.custom((value, { req }) =>
			hasPageNumberAndPageSize(req.query?.pageNumber, req.query?.pageSize)
		)
		.withMessage(ERROR_PAGENUMBER_AND_PAGESIZE_ARE_REQUIRED);

const getAppealsValidator = composeMiddleware(
	validatePaginationParameter('pageNumber'),
	validatePaginationParameter('pageSize'),
	query('searchTerm')
		.optional()
		.isString()
		.isLength({ min: 2, max: 50 })
		.withMessage(ERROR_LENGTH_BETWEEN_MIN_AND_MAX_CHARACTERS('2', '50')),
	validationErrorHandler
);

export { getAppealsValidator };
