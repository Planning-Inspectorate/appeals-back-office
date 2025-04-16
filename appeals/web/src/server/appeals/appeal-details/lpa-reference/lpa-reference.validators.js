import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeLpaReference = createValidator(
	body('planningApplicationReference')
		.trim()
		.notEmpty()
		.withMessage('Enter the application reference number')
		.isLength({ max: 100 })
		.withMessage('Application reference number must be 100 characters or less')
);
