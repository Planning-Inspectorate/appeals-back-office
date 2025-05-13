import { createPostcodeValidator } from '#lib/validators/address.validator.js';
import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

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
