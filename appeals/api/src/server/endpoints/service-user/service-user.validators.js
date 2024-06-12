import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	validateRequiredStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateNumberParameter, {
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';
import { validateEmailParameter } from '#common/validators/email-parameter.js';
import { validateUserType } from '#common/validators/user-type-parameter.js';

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
