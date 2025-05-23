import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { stringIsValidPostcodeFormat } from '#lib/postcode.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
const maxAddressLength = textInputCharacterLimits.defaultAddressInputLength;

export const createPostcodeValidator = (
	fieldName = 'postCode',
	emptyErrorMessage = 'Enter postcode',
	invalidErrorMessage = 'Enter a full UK postcode'
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
	emptyErrorMessage = 'Enter address line 1',
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

export const createAddressLine2Validator = (
	fieldName = 'addressLine2',
	maxLength = maxAddressLength
) =>
	createValidator(
		body(fieldName)
			.trim()
			.isLength({ max: maxLength })
			.withMessage(`Address line 2 must be ${maxLength} characters or less`)
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
			.withMessage(`Town or city must be ${maxLength} characters or less`)
	);
