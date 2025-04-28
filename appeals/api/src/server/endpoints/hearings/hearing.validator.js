import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import {
	validateRequiredStringParameter,
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	ERROR_INVALID_POSTCODE,
	LENGTH_250,
	LENGTH_8,
	UK_POSTCODE_REGEX
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';

export const getHearingValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('hearingId'),
	validationErrorHandler
);

export const postHearingValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('addressId'),
	validateDateParameter({ parameterName: 'hearingStartTime' }),
	validateDateParameter({ parameterName: 'hearingEndTime' }),
	validateRequiredStringParameter('address.addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('address.addressLine2', LENGTH_250),
	validateRequiredStringParameter('address.town', LENGTH_250),
	validateStringParameter('address.country', LENGTH_250),
	validateStringParameterAllowingEmpty('address.county', LENGTH_250),
	validateRequiredStringParameter('address.postcode', LENGTH_8),
	validateRegex('address.postcode', UK_POSTCODE_REGEX).withMessage(ERROR_INVALID_POSTCODE),
	validationErrorHandler
);

export const patchHearingValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('hearingId'),
	validateIdParameter('addressId'),
	validateDateParameter({ parameterName: 'hearingStartTime' }),
	validateDateParameter({ parameterName: 'hearingEndTime' }),
	validateRequiredStringParameter('address.addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('address.addressLine2', LENGTH_250),
	validateRequiredStringParameter('address.town', LENGTH_250),
	validateStringParameter('address.country', LENGTH_250),
	validateStringParameterAllowingEmpty('address.county', LENGTH_250),
	validateRequiredStringParameter('address.postcode', LENGTH_8),
	validateRegex('address.postcode', UK_POSTCODE_REGEX).withMessage(ERROR_INVALID_POSTCODE),
	validationErrorHandler
);
