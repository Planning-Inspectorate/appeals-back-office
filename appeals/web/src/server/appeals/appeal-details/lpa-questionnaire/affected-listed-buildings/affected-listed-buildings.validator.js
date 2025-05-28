import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAffectedListedBuilding = createValidator(
	body('affectedListedBuilding').notEmpty().withMessage('Enter a listed building number'),
	body('affectedListedBuilding')
		.isLength({ min: 7, max: 7 })
		.withMessage('Listed building number must be 7 digits'),
	body('affectedListedBuilding')
		.matches(/^[0-9]+$/)
		.withMessage('Enter a listed building number using numbers 0 to 9')
);
