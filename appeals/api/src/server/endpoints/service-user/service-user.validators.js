import { validateEmailParameter } from '#common/validators/email-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import {
	validateNumberParameter,
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';
import {
	validateRequiredStringParameter,
	validateStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import { validateUserType } from '#common/validators/user-type-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { LENGTH_250, LENGTH_8 } from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';

export const updateServiceUserValidator = composeMiddleware(
	validateRequiredNumberParameter('serviceUser.serviceUserId'),
	validateUserType('serviceUser.userType'),
	validateRequiredStringParameter('serviceUser.firstName'),
	validateRequiredStringParameter('serviceUser.lastName'),
	validateStringParameterAllowingEmpty('serviceUser.organisationName'),
	validateStringParameterAllowingEmpty('serviceUser.middleName'),
	validateEmailParameter('serviceUser.email'),
	validateStringParameterAllowingEmpty('serviceUser.phoneNumber'),
	validateNumberParameter('serviceUser.addressId'),
	validationErrorHandler
);

export const patchAddressValidator = composeMiddleware(
	validateIdParameter('serviceUserId'),
	validateStringParameter('addressLine1', LENGTH_250),
	validateStringParameterAllowingEmpty('addressLine2', LENGTH_250),
	validateStringParameter('country', LENGTH_250),
	validateStringParameterAllowingEmpty('county', LENGTH_250),
	validateStringParameter('town', LENGTH_250),
	validateStringParameter('postcode', LENGTH_8),
	validationErrorHandler
);

export const removeServiceUserValidator = composeMiddleware(
	validateIdParameter('serviceUserId'),
	validateUserType('serviceUser.userType')
);
