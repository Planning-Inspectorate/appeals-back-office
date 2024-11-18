import {
	createAddressLine1Validator,
	createTownValidator,
	createPostcodeValidator
} from '#lib/validators/address.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateAddNeighbouringSite = createValidator(
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

export const validateNeighbouringSiteDeleteAnswer = createValidator(
	body('remove-neighbouring-site').trim().notEmpty().withMessage('Answer must be provided')
);
