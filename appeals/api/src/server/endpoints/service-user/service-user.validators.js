import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	validateStringParameter,
	validateRequiredStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import validateNumberParameter, {
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';
import { validateEmailParameter } from '#common/validators/email-parameter.js';
import { validateUserType } from '#common/validators/user-type-parameter.js';
import { LENGTH_8 } from '#endpoints/constants.js';

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
	validateStringParameter('addressLine1'),
	validateStringParameterAllowingEmpty('addressLine2'),
	validateStringParameter('country'),
	validateStringParameterAllowingEmpty('county'),
	validateStringParameter('postcode', LENGTH_8),
	validateStringParameter('town'),
	validationErrorHandler
);
