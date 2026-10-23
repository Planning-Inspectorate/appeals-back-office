import { validationErrorHandler } from '#middleware/error-handler.js';
import { composeMiddleware } from '@pins/express';
import { param } from 'express-validator';

export const validateCaseFilePackageAppealId = composeMiddleware(
	param('appealId').isInt({ min: 1, max: Number.MAX_SAFE_INTEGER }),
	validationErrorHandler
);
