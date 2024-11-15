import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	validateRequiredStringParameter,
	validateStringParameterAllowingEmpty
} from '#common/validators/string-parameter.js';
import validateRegex from '#common/validators/regex-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import {
	validateNumberParameter,
	validateRequiredNumberParameter
} from '#common/validators/number-parameter.js';
import { validateEmailParameter } from '#common/validators/email-parameter.js';
import { validateUserType } from '#common/validators/user-type-parameter.js';
import { UK_POSTCODE_REGEX, ERROR_INVALID_POSTCODE } from '#endpoints/constants.js';

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
	validateRequiredStringParameter('addressLine1', 250),
	validateStringParameterAllowingEmpty('addressLine2', 250),
	validateRequiredStringParameter('town', 250),
	validateStringParameterAllowingEmpty('county', 250),
	validateRequiredStringParameter('postcode', 8),
	validateRegex('postcode', UK_POSTCODE_REGEX).withMessage(ERROR_INVALID_POSTCODE),
	validationErrorHandler
);
