import validateIdParameter from '#common/validators/id-parameter.js';
import {
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { LENGTH_250, LENGTH_8 } from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';

const getAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('addressId'),
	validationErrorHandler
);

const patchAddressValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('addressId'),
	validateStringParameter('addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('addressLine2', LENGTH_250),
	validateStringParameter('town', LENGTH_250),
	validateStringParameter('country', LENGTH_250),
	validateStringParameterAllowingEmpty('county', LENGTH_250),
	validateStringParameter('postcode', LENGTH_8),
	validationErrorHandler
);

export { getAddressValidator, patchAddressValidator };
