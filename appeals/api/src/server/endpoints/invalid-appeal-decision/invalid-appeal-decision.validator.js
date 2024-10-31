import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { validateTextAreaParameter } from '#common/validators/string-parameter.js';

const getInvalidDecisionReasonValidator = composeMiddleware(
	validateTextAreaParameter('invalidDecisionReason', 1000),
	validationErrorHandler
);

export { getInvalidDecisionReasonValidator };
