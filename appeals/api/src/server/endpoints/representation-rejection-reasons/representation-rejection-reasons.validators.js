import { validationErrorHandler } from '#middleware/error-handler.js';
import { APPEAL_REPRESENTATION_TYPE } from '@pins/appeals/constants/common.js';
import { ERROR_INVALID_REPRESENTATION_TYPE } from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { query } from 'express-validator';

export const validateRepresentationType = composeMiddleware(
	query('type')
		.optional()
		.isIn(Object.values(APPEAL_REPRESENTATION_TYPE))
		.withMessage(ERROR_INVALID_REPRESENTATION_TYPE),
	validationErrorHandler
);
