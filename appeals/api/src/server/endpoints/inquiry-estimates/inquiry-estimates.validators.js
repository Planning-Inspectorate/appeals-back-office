import { validationErrorHandler } from '#middleware/error-handler.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';
import {
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_MUST_BE_NUMBER,
	ERROR_NUMBER_INCREMENTS,
	ERROR_NUMBER_RANGE
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

/**
 * @param {string} paramName
 * @returns {import('express-validator').ValidationChain}
 */
const validateDayOrHalfDayParameter = (paramName) =>
	body(paramName)
		.trim()
		.notEmpty()
		.withMessage(ERROR_CANNOT_BE_EMPTY_STRING)
		.bail()
		.isNumeric()
		.withMessage(ERROR_MUST_BE_NUMBER)
		.bail()
		.isFloat({ min: 0, max: 99 })
		.withMessage(stringTokenReplacement(ERROR_NUMBER_RANGE, ['0', '99']))
		.bail()
		.custom((value) => {
			const floatValue = parseFloat(value);
			return floatValue % 0.5 === 0;
		})
		.withMessage(stringTokenReplacement(ERROR_NUMBER_INCREMENTS, ['0.5']));

const createInquiryEstimateValidator = composeMiddleware(
	validateDayOrHalfDayParameter('preparationTime'),
	validateDayOrHalfDayParameter('sittingTime'),
	validateDayOrHalfDayParameter('reportingTime'),
	validationErrorHandler
);

const updateInquiryEstimateValidator = composeMiddleware(
	validateDayOrHalfDayParameter('preparationTime'),
	validateDayOrHalfDayParameter('sittingTime'),
	validateDayOrHalfDayParameter('reportingTime'),
	validationErrorHandler
);

export { createInquiryEstimateValidator, updateInquiryEstimateValidator };
