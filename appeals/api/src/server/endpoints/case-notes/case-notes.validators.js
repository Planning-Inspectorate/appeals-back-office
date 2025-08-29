import validateIdParameter from '#common/validators/id-parameter.js';
import { validateTextAreaParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

export const postCaseNoteValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateTextAreaParameter('comment', 500),
	validationErrorHandler
);
