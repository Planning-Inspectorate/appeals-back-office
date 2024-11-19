import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	createTextInputOptionalValidator,
	createTextInputValidator
} from '#lib/validators/text-input-validator.js';
import { createEmailInputOptionalValidator } from '#lib/validators/email-input.validator.js';
import {
	createPostcodeValidator,
	createAddressLine1Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateCheckAddress = createValidator(
	body('addressProvided')
		.exists()
		.withMessage('Please indicate whether the interested party provided an address.')
);

export const validateRedactionStatus = createValidator(
	body('redactionStatus').exists().withMessage('Please select a redaction status.')
);

export const validateInterestedPartyDetails = createValidator(
	createTextInputValidator(
		'firstName',
		'Enter the first name',
		maxLength,
		`First name must be ${maxLength} characters or less`
	),
	createTextInputValidator(
		'lastName',
		'Enter the last name',
		maxLength,
		`Last name must be ${maxLength} characters or less`
	),
	createEmailInputOptionalValidator('emailAddress')
);

export const validateInterestedPartyAddress = createValidator(
	createAddressLine1Validator(),
	createTextInputOptionalValidator(
		'addressLine2',
		maxLength,
		`Address line 2 must be ${maxLength} characters or less`
	),
	createTownValidator(),
	createTextInputOptionalValidator(
		'county',
		maxLength,
		`County must be ${maxLength} characters or less`
	),
	createPostcodeValidator()
);
