import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	validateRequiredStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import {
	validateNumberParameter,
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';
import { ERROR_INVALID_POSTCODE, UK_POSTCODE_REGEX } from '#endpoints/constants.js';

const createNeighbouringSiteValidator = composeMiddleware(
	validateRequiredStringParameter('addressLine1', 250),
	validateStringParameterAllowingEmpty('addressLine2', 250),
	validateRequiredStringParameter('town', 250),
	validateStringParameterAllowingEmpty('county', 250),
	validateRequiredStringParameter('postcode', 8),
	validateRegex('postcode', UK_POSTCODE_REGEX).withMessage(ERROR_INVALID_POSTCODE),
	validationErrorHandler
);

const updateNeighbouringSiteValidator = composeMiddleware(
	validateRequiredNumberParameter('siteId'),
	validateRequiredStringParameter('address.addressLine1', 250),
	validateStringParameterAllowingEmpty('address.addressLine2', 250),
	validateRequiredStringParameter('address.town', 250),
	validateStringParameterAllowingEmpty('address.county', 250),
	validateRequiredStringParameter('address.postcode', 8),
	validateRegex('address.postcode', UK_POSTCODE_REGEX).withMessage(ERROR_INVALID_POSTCODE),
	validationErrorHandler
);

const deleteNeighbouringSiteValidator = composeMiddleware(
	validateNumberParameter('siteId'),
	validationErrorHandler
);

export {
	createNeighbouringSiteValidator,
	updateNeighbouringSiteValidator,
	deleteNeighbouringSiteValidator
};
