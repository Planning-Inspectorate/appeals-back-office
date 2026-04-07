import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateSignificantChanges = createValidator(
	body('anySignificantChangesRadio')
		.notEmpty()
		.withMessage('Select yes if you have any significant changes that would affect the application')
		.bail()
		.isIn(['yes', 'no'])
		.withMessage('There is a problem')
);
