import validateIdParameter from '#common/validators/id-parameter.js';
import { validateRequiredStringParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

export const validateAppealStatusRollBackRequest = composeMiddleware(
	validateIdParameter('appealId'),
	validateRequiredStringParameter('status'),
	validationErrorHandler
);
