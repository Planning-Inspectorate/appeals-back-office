import {
	createAddressLine1Validator,
	createTownValidator,
	createPostcodeValidator
} from '#lib/validators/address.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAddNeighbouringSite = createValidator(
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

export const validateNeighbouringSiteDeleteAnswer = createValidator(
	body('remove-neighbouring-site').trim().notEmpty().withMessage('Answer must be provided')
);
