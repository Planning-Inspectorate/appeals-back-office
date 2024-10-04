import { createPostcodeValidator } from '#lib/validators/address.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAddNeighbouringSite = createValidator(
	body('addressLine1').trim().notEmpty().withMessage('Enter the first line of the address'),
	body('town').trim().notEmpty().withMessage('Enter the town')
);

export const validateNeighbouringSiteDeleteAnswer = createValidator(
	body('remove-neighbouring-site').trim().notEmpty().withMessage('Answer must be provided')
);

export const validatePostCode = createPostcodeValidator();
