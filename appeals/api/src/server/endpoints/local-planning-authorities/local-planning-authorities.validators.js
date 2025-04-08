import validateIdParameter from '#common/validators/id-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

export const postLpaValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validationErrorHandler
);
