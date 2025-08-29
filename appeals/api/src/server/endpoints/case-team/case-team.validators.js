import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

export const updateAssignedCaseIdValidator = composeMiddleware(
	body('teamId')
		.exists()
		.withMessage('teamId is required')
		.isInt({ min: 0 })
		.withMessage('teamId must be a number equal to or greater than 0'),

	validationErrorHandler
);
