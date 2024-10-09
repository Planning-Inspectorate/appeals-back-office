import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const createFirstNameValidator = (
	fieldName = 'firstName',
	emptyErrorMessage = "Enter the interested party's first name",
	maxLength = 250
) =>
	createValidator(
		body(fieldName)
			.trim()
			.notEmpty()
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxLength })
			.withMessage(`First name must be ${maxLength} characters or less`)
	);

export const createLastNameValidator = (
	fieldName = 'lastName',
	emptyErrorMessage = "Enter interested party's last name",
	maxLength = 250
) =>
	createValidator(
		body(fieldName)
			.trim()
			.notEmpty()
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxLength })
			.withMessage(`Last name must be ${maxLength} characters or less`)
	);

export const createEmailValidator = (fieldName = 'emailAddress', maxLength = 254) =>
	createValidator(
		body(fieldName)
			.optional({ nullable: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage('Enter an email address in the correct format, like name@example.com')
			.bail()
			.isLength({ max: maxLength })
			.withMessage('Email must be 254 characters or less')
	);
