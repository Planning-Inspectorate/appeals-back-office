import { createValidator } from '@pins/express';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import {
	createPostcodeValidator,
	createAddressLine1Validator,
	createAddressLine2Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateInterestedPartyAddress = createValidator(
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
