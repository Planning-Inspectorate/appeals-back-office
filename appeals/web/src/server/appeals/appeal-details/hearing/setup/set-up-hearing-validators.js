import { createPostcodeValidator } from '#lib/validators/address.validator.js';
import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createDateInputFieldsValidator } from '#lib/validators/date-input.validator.js';
import { createDateInputDateValidityValidator } from '#lib/validators/date-input.validator.js';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { createDateInputDateInFutureValidator } from '#lib/validators/date-input.validator.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateHearingDateTime = createValidator(
	createDateInputFieldsValidator('hearing-date', 'Hearing date'),
	createDateInputDateValidityValidator('hearing-date', 'Hearing date'),
	createDateInputDateInFutureValidator('hearing-date', 'Hearing date'),
	createTimeInputValidator('hearing-time', 'hearing time')
);

export const validateAddressKnown = createYesNoRadioValidator(
	'addressKnown',
	'Select yes if you know the address of where the hearing will take place'
);

const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateHearingAddress = createValidator(
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
