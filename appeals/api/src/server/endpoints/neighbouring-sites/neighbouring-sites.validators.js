import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	validateStringParameter,
	validateRequiredStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import validateNumberParameter, {
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';
import { ERROR_INVALID_POSTCODE } from '#endpoints/constants.js';

const regexUkPostcode = /^([A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/gm;

const createNeighbouringSiteValidator = composeMiddleware(
	validateRequiredStringParameter('postcode'),
	validateRequiredStringParameter('addressLine1'),
	validateRequiredStringParameter('town'),
	validateStringParameter('addressLine2'),
	validateStringParameter('country'),
	validateStringParameter('county'),
	validateRegex('postcode', regexUkPostcode),
	validationErrorHandler
);

const updateNeighbouringSiteValidator = composeMiddleware(
	validateRequiredNumberParameter('siteId'),
	validateRequiredStringParameter('address.postcode'),
	validateRequiredStringParameter('address.addressLine1'),
	validateRequiredStringParameter('address.town'),
	validateStringParameterAllowingEmpty('address.addressLine2'),
	validateStringParameterAllowingEmpty('address.county'),
	validateRegex('address.postcode', regexUkPostcode).withMessage(ERROR_INVALID_POSTCODE),
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
