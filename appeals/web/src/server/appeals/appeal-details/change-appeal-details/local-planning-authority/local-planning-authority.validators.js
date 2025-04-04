import { createValidator } from '@pins/express';
import { body } from 'express-validator';

//todo: a2-2605 confirm validation error message with design
export const validateLpa = createValidator(
	body('localPlanningAuthority')
		.trim()
		.notEmpty()
		.withMessage('Please choose a local planning authority.')
);
