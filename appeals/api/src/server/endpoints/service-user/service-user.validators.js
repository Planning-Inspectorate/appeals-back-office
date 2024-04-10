import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	validateRequiredStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateNumberParameter, {
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';

export const updateServiceUserValidator = composeMiddleware(
	validateRequiredNumberParameter('serviceUser.serviceUserId'),
	validateRequiredStringParameter('serviceUser.firstName'),
	validateRequiredStringParameter('serviceUser.lastName'),
	validateStringParameterAllowingEmpty('serviceUser.organisationName'),
	validateStringParameterAllowingEmpty('serviceUser.middleName'),
	validateStringParameterAllowingEmpty('serviceUser.email'),
	validateStringParameterAllowingEmpty('serviceUser.phoneNumber'),
	validateNumberParameter('serviceUser.addressId'),
	validationErrorHandler
);
