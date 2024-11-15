import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import {
	validateNumberParameter,
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';
import {
	ERROR_INVALID_POSTCODE,
	UK_POSTCODE_REGEX,
	LENGTH_8,
	LENGTH_250
} from '#endpoints/constants.js';

const createNeighbouringSiteValidator = composeMiddleware(
	validateStringParameter('addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('addressLine2', LENGTH_250),
	validateStringParameter('town', LENGTH_250),
	validateStringParameterAllowingEmpty('county', LENGTH_250),
	validateStringParameter('postcode', LENGTH_8),
	validateRegex('postcode', UK_POSTCODE_REGEX).withMessage(ERROR_INVALID_POSTCODE),
	validationErrorHandler
);

const updateNeighbouringSiteValidator = composeMiddleware(
	validateRequiredNumberParameter('siteId'),
	validateStringParameter('address.addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('address.addressLine2', LENGTH_250),
	validateStringParameter('address.town', LENGTH_250),
	validateStringParameterAllowingEmpty('address.county', LENGTH_250),
	validateStringParameter('address.postcode', LENGTH_8),
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
