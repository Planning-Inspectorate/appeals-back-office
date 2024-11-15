import {
	createAddressLine1Validator,
	createTownValidator,
	createPostcodeValidator
} from '#lib/validators/address.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';

export const validateChangeSiteAddress = createValidator(
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
