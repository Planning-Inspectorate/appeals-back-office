import { composeMiddleware } from '@pins/express';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { validateRequiredBooleanParameter } from '#common/validators/boolean-parameter.js';

const getEiaScreeningRequirementValidator = composeMiddleware(
	validateRequiredBooleanParameter('eiaScreeningRequired'),
	validationErrorHandler
);

export { getEiaScreeningRequirementValidator };
