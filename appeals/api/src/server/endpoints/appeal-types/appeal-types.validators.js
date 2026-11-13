import { validateRequiredBooleanParameter } from '#common/validators/boolean-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';
import { param } from 'express-validator';

export const patchAppealTypeNotifySuppressionValidator = composeMiddleware(
	param('id').notEmpty().withMessage('id is required'),
	validateRequiredBooleanParameter('suppressNotifications'),
	validationErrorHandler
);
