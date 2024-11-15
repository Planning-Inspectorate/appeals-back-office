import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
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

export const validateCheckAddress = createValidator(
	body('addressProvided')
		.exists()
		.withMessage('Please indicate whether the interested party provided an address.')
);

export const validateRedactionStatus = createValidator(
	body('redactionStatus').exists().withMessage('Please select a redaction status.')
);

export const validateCommentSubmittedDateFields = createDateInputFieldsValidator(
	'date',
	'submitted date'
);

export const validateCommentSubmittedDateValid = createDateInputDateValidityValidator(
	'date',
	'submitted date'
);

export const validateInterestedPartyDetails = createValidator(
	createTextInputValidator(
		'firstName',
		'Enter the first name',
		250,
		`First name must be 250 characters or less`
	),
	createTextInputValidator(
		'lastName',
		'Enter the last name',
		250,
		`Last name must be 250 characters or less`
	),
	createEmailInputOptionalValidator('emailAddress')
);

export const validateInterestedPartyAddress = createValidator(
	createAddressLine1Validator(),
	createTextInputOptionalValidator(
		'addressLine2',
		250,
		'Address line 2 must be 250 characters or less'
	),
	createTownValidator(),
	createTextInputOptionalValidator('county', 250, 'County must be 250 characters or less'),
	createPostcodeValidator()
);
