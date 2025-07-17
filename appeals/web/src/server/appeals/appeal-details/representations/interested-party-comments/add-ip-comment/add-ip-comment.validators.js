import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { createTextInputValidator } from '#lib/validators/text-input-validator.js';
import { createEmailInputOptionalValidator } from '#lib/validators/email-input.validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateCheckAddress = createValidator(
	body('addressProvided')
		.exists()
		.withMessage('Select yes if the interested party provided an address')
);

export const validateInterestedPartyDetails = createValidator(
	createTextInputValidator(
		'firstName',
		'Enter a first name',
		maxLength,
		`First name must be ${maxLength} characters or less`
	),
	createTextInputValidator(
		'lastName',
		'Enter a last name',
		maxLength,
		`Last name must be ${maxLength} characters or less`
	),
	createEmailInputOptionalValidator('emailAddress')
);
