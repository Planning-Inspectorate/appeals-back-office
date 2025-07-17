import { validateTextAreaParameter } from '#common/validators/string-parameter.js';
import { composeMiddleware } from '@pins/express';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';

export const postCaseNoteValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateTextAreaParameter('comment', 500),
	validationErrorHandler
);
