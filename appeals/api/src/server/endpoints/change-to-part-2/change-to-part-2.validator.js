import validateDateParameter from '#common/validators/date-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { PROCEDURE_TYPE_KEY } from '@pins/appeals/constants/common.js';

import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

const appealProcedureValues = Object.values(PROCEDURE_TYPE_KEY);
/** @param {{body?: Record<string, unknown>}} request */

export const postChangeProcedureTypeValidator = composeMiddleware(
	validateIdParameter('appealId'),

	body('appealProcedure')
		.notEmpty()
		.withMessage('appealProcedure is required')
		.isIn(appealProcedureValues)
		.withMessage(`appealProcedure must be one of: ${appealProcedureValues.join(', ')}`),

	validateDateParameter({
		parameterName: 'appealDueDate',
		isRequired: true
	}),

	validationErrorHandler
);
