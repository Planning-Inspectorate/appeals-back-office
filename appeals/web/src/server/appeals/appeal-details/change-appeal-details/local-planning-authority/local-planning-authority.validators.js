import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateLpa = createValidator(
	body('localPlanningAuthority')
		.trim()
		.notEmpty()
		.withMessage('Select the local planning authority.')
);
