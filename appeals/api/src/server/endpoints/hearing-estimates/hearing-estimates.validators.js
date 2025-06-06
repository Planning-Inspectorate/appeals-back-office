import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { body } from 'express-validator';
import {
	ERROR_CANNOT_BE_EMPTY_STRING,
	ERROR_MUST_BE_NUMBER,
	ERROR_NUMBER_RANGE,
	ERROR_NUMBER_INCREMENTS
} from '@pins/appeals/constants/support.js';
import stringTokenReplacement from '#utils/string-token-replacement.js';

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

const createHearingEstimateValidator = composeMiddleware(
	validateDayOrHalfDayParameter('preparationTime'),
	validateDayOrHalfDayParameter('sittingTime'),
	validateDayOrHalfDayParameter('reportingTime'),
	validationErrorHandler
);

const updateHearingEstimateValidator = composeMiddleware(
	validateDayOrHalfDayParameter('preparationTime'),
	validateDayOrHalfDayParameter('sittingTime'),
	validateDayOrHalfDayParameter('reportingTime'),
	validationErrorHandler
);

export { createHearingEstimateValidator, updateHearingEstimateValidator };
