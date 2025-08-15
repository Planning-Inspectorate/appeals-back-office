import { validateEnumParameterPath } from '#common/validators/enum-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validateRequiredStringParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';
import { APPEAL_CASE_STATUS } from '@planning-inspectorate/data-model';

export const validateAppealStatusRollBackRequest = composeMiddleware(
	validateIdParameter('appealId'),
	validateRequiredStringParameter('status'),
	validationErrorHandler
);

export const getAppealStatusDateValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateEnumParameterPath('status', Object.values(APPEAL_CASE_STATUS), false),
	validationErrorHandler
);
