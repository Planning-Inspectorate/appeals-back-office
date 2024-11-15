import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	createTextInputOptionalValidator,
	createTextInputValidator
} from '#lib/validators/text-input-validator.js';
import { createEmailInputOptionalValidator } from '#lib/validators/email-input.validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

export const validateChangeServiceUser = createValidator(
	createTextInputValidator(
		'firstName',
		'Enter the first name',
		textInputCharacterLimits.defaultInputLength,
		`First name must be ${textInputCharacterLimits.defaultInputLength} characters or less`
	),
	createTextInputValidator(
		'lastName',
		'Enter the last name',
		textInputCharacterLimits.defaultInputLength,
		`Last name must be ${textInputCharacterLimits.defaultInputLength} characters or less`
	),
	createTextInputOptionalValidator(
		'organisationName',
		textInputCharacterLimits.defaultInputLength,
		`Organisation name must be ${textInputCharacterLimits.defaultInputLength} characters or less`
	),
	createEmailInputOptionalValidator('emailAddress'),
	body('phoneNumber')
		.trim()
		.optional({ checkFalsy: true })
		.bail()
		.isString()
		.isLength({ min: 10, max: 15 })
		.withMessage('Enter a valid phone number or clear the phone number field')
);
