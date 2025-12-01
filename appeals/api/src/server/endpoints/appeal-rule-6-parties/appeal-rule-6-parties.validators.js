import { validateEmailParameter } from '#common/validators/email-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validateRequiredStringParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

export const getRule6PartiesValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validationErrorHandler
);

export const addRule6PartyValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateRequiredStringParameter('serviceUser.organisationName'),
	validateEmailParameter('serviceUser.email', false),
	validationErrorHandler
);
