import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import {
	validateRequiredStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import { UK_POSTCODE_REGEX, ERROR_INVALID_POSTCODE } from '#endpoints/constants.js';

const getAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('addressId'),
	validationErrorHandler
);

const patchAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('addressId'),
	validateRequiredStringParameter('addressLine1', 250),
	validateStringParameterAllowingEmpty('addressLine2', 250),
	validateRequiredStringParameter('town', 250),
	validateStringParameterAllowingEmpty('county', 250),
	validateRequiredStringParameter('postcode', 8),
	validateRegex('postcode', UK_POSTCODE_REGEX).withMessage(ERROR_INVALID_POSTCODE),
	validationErrorHandler
);

export { getAddressValidator, patchAddressValidator };
