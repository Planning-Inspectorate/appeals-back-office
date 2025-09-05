import { validateTextAreaParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

const getInvalidDecisionReasonValidator = composeMiddleware(
	validateTextAreaParameter('invalidDecisionReason', 1000),
	validationErrorHandler
);

export { getInvalidDecisionReasonValidator };
