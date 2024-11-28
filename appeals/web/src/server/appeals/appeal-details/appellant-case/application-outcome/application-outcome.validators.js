import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateOutcome = createValidator(
	body('applicationOutcome')
		.notEmpty()
		.isIn(['granted', 'refused', 'not_received'])
		.withMessage('Select one of the options')
);
