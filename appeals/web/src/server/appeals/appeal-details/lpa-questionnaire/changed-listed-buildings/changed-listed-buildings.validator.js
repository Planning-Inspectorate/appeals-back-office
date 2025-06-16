import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangedListedBuilding = createValidator(
	body('changedListedBuilding')
		.notEmpty()
		.withMessage('Provide a listed building entry list number')
		.isNumeric()
		.withMessage('Listed building entry number must be 7 digits')
		.isLength({ min: 7, max: 7 })
		.withMessage('Listed building entry number must be 7 digits')
);
