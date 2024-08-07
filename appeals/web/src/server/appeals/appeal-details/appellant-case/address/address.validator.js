import { createPostcodeValidator } from '#lib/validators/postcode.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeSiteAddress = createValidator(
	body('addressLine1').trim().notEmpty().withMessage('Enter the first line of the address'),
	body('town').trim().notEmpty().withMessage('Enter the town'),
	createPostcodeValidator()
);

export const validatePostCode = createPostcodeValidator();
