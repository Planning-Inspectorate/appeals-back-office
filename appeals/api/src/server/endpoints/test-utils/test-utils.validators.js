import validateNumberArrayParameter from '#common/validators/number-array-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

export const deleteAppealsParamsValidator = composeMiddleware(
	validateNumberArrayParameter('appealIds', true),
	validationErrorHandler
);
