import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createPostcodeValidator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';

const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateAddress = createValidator(
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
