import { createValidator } from '@pins/express';
import { createDateInputFieldsValidator } from '#lib/validators/date-input.validator.js';
import { createDateInputDateValidityValidator } from '#lib/validators/date-input.validator.js';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { createDateInputDateInFutureValidator } from '#lib/validators/date-input.validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createPostcodeValidator } from '#lib/validators/address.validator.js';
import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';

export const validateInquiryDateTime = createValidator(
	createDateInputFieldsValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateValidityValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateInFutureValidator('inquiry-date', 'Inquiry date'),
	createTimeInputValidator('inquiry-time', 'inquiry time')
);

export const validateAddressKnown = createYesNoRadioValidator(
	'addressKnown',
	'Select yes if you know the address of where the inquiry will take place'
);

const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateInquiryAddress = createValidator(
	createAddressLine1Validator(),
	createAddressLine2Validator(),
	createTownValidator(),
	createTextInputOptionalValidator(
		'county',
		maxLength,
		`County must be ${maxLength} characters or less`
	),
	createPostcodeValidator()
);
