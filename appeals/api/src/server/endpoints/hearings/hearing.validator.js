import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import {
	validateRequiredStringParameter,
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { dateIsAfterDate } from '#utils/date-comparison.js';
import {
	ERROR_INVALID_POSTCODE,
	ERROR_MUST_BE_IN_FUTURE,
	ERROR_MUST_BE_NUMBER,
	LENGTH_250,
	LENGTH_8,
	UK_POSTCODE_REGEX
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body, check } from 'express-validator';

export const getHearingValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('hearingId'),
	validationErrorHandler
);

export const postHearingValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateDateParameter({ parameterName: 'hearingStartTime', isRequired: true }),
	validateDateParameter({ parameterName: 'hearingEndTime' }),
	body('addressId').optional().isNumeric().withMessage(ERROR_MUST_BE_NUMBER),
	body('address').optional(),
	validateRequiredStringParameter('address.addressLine1', LENGTH_250, 'address'),
	validateStringParameterAllowingEmpty('address.addressLine2', LENGTH_250),
	validateRequiredStringParameter('address.town', LENGTH_250, 'address'),
	validateStringParameter('address.country', LENGTH_250),
	validateStringParameterAllowingEmpty('address.county', LENGTH_250),
	validateRequiredStringParameter('address.postcode', LENGTH_8, 'address'),
	validateRegex('address.postcode', UK_POSTCODE_REGEX, 'address').withMessage(
		ERROR_INVALID_POSTCODE
	),
	validationErrorHandler
);

export const patchHearingValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('hearingId'),
	validateDateParameter({ parameterName: 'hearingStartTime', isRequired: true }),
	validateDateParameter({ parameterName: 'hearingEndTime' }),
	body('addressId').optional().isNumeric().withMessage(ERROR_MUST_BE_NUMBER),
	body('address').optional({ values: 'null' }),
	validateRequiredStringParameter('address.addressLine1', LENGTH_250, 'address'),
	validateStringParameterAllowingEmpty('address.addressLine2', LENGTH_250),
	validateRequiredStringParameter('address.town', LENGTH_250, 'address'),
	validateStringParameter('address.country', LENGTH_250),
	validateStringParameterAllowingEmpty('address.county', LENGTH_250),
	validateRequiredStringParameter('address.postcode', LENGTH_8, 'address'),
	validateRegex('address.postcode', UK_POSTCODE_REGEX, 'address').withMessage(
		ERROR_INVALID_POSTCODE
	),
	validationErrorHandler
);

export const deleteHearingParamsValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('hearingId'),
	validationErrorHandler
);

export const deleteHearingDateValidator = composeMiddleware(
	check('hearingStartTime').custom(async (_value, { req }) => {
		const { hearingStartTime } = req.appeal.hearing;
		if (!dateIsAfterDate(hearingStartTime, new Date())) {
			throw new Error(ERROR_MUST_BE_IN_FUTURE);
		}
	}),
	validationErrorHandler
);
