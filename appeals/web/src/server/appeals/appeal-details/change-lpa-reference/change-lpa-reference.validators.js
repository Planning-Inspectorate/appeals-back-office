import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeLpaReference = createValidator(
	body('planningApplicationReference')
		.trim()
		.notEmpty()
		.withMessage('Enter the planning application reference')
);
