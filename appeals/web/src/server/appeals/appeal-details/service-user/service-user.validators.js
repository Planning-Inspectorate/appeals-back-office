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
		.withMessage('Enter a valid email or clear the email field'),
	body('phoneNumber')
		.trim()
		.optional({ checkFalsy: true })
		.bail()
		.isString()
		.isLength({ min: 10, max: 15 })
		.withMessage('Enter a valid phone number or clear the email field')
);
