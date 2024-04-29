import { createValidator } from '@pins/express';
import { body } from 'express-validator';

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
				const regex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$/gm;

				return postcode.match(regex);
			})
			.withMessage(invalidErrorMessage)
	);
