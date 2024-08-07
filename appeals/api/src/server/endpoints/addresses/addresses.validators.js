import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import {
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import { LENGTH_8 } from '#endpoints/constants.js';

const getAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('addressId'),
	validationErrorHandler
);

const patchAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('addressId'),
	validateStringParameter('addressLine1'),
	validateStringParameterAllowingEmpty('addressLine2'),
	validateStringParameter('country'),
	validateStringParameterAllowingEmpty('county'),
	validateStringParameter('postcode', LENGTH_8),
	validateStringParameter('town'),
	validationErrorHandler
);

export { getAddressValidator, patchAddressValidator };
