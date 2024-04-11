import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeServiceUser = createValidator(
	body('firstName').trim().notEmpty().withMessage('Enter the first name'),
	body('lastName').trim().notEmpty().withMessage('Enter the last name'),
	body('emailAddress')
		.trim()
		.optional({ checkFalsy: true })
		.bail()
		.isEmail()
		.withMessage('Enter a valid email or clear the email field')
);
