import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { stringIsValidPostcodeFormat } from '#lib/postcode.js';

export const createPostcodeValidator = (
	fieldName = 'postCode',
	emptyErrorMessage = 'Enter postcode',
	invalidErrorMessage = 'Invalid postcode'
) =>
	createValidator(
		body(fieldName)
			.trim()
			.notEmpty()
			.withMessage(emptyErrorMessage)
			.bail()
			.custom((postcode) => {
				return stringIsValidPostcodeFormat(postcode);
			})
			.withMessage(invalidErrorMessage)
	);
