import { validateRequiredBooleanParameter } from '#common/validators/boolean-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';

const getEiaScreeningRequirementValidator = composeMiddleware(
	validateRequiredBooleanParameter('eiaScreeningRequired'),
	validationErrorHandler
);

export { getEiaScreeningRequirementValidator };
