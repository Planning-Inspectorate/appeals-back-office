import validateIdParameter from '#common/validators/id-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { ERROR_MUST_BE_BOOLEAN } from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

export const patchNotifySuppressionValidator = composeMiddleware(
	validateIdParameter('appealId'),
	body('suppressNotifications')
		.custom((value) => {
			if (value === null || typeof value === 'boolean') {
				return true;
			}
			throw new Error(ERROR_MUST_BE_BOOLEAN);
		})
		.withMessage(ERROR_MUST_BE_BOOLEAN),
	validationErrorHandler
);
