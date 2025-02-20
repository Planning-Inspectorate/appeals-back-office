import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { stringIsValidPostcodeFormat } from '#lib/postcode.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
const maxAddressLength = textInputCharacterLimits.defaultAddressInputLength;

export const createPostcodeValidator = (
	fieldName = 'postCode',
	emptyErrorMessage = 'Enter a full UK postcode',
	invalidErrorMessage = 'Invalid postcode'
) =>
	createValidator(
		body(fieldName)
			.trim()
			.notEmpty()
			.withMessage(emptyErrorMessage)
			.bail()
			.custom(stringIsValidPostcodeFormat)
			.withMessage(invalidErrorMessage)
	);

export const createAddressLine1Validator = (
	fieldName = 'addressLine1',
	emptyErrorMessage = 'Enter address line 1, typically the building and street',
	maxLength = maxAddressLength
) =>
	createValidator(
		body(fieldName)
			.trim()
			.notEmpty()
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxLength })
			.withMessage(`Address line 1 must be ${maxLength} characters or less`)
	);

export const createTownValidator = (
	fieldName = 'town',
	emptyErrorMessage = 'Enter town or city',
	maxLength = maxAddressLength
) =>
	createValidator(
		body(fieldName)
			.trim()
			.notEmpty()
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxLength })
			.withMessage(`Town must be ${maxLength} characters or less`)
	);
