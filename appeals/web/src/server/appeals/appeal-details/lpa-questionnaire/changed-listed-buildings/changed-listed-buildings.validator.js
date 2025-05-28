import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangedListedBuilding = createValidator([
	body('changedListedBuilding').notEmpty().withMessage('Enter a listed building number'),
	body('changedListedBuilding')
		.isLength({ min: 7, max: 7 })
		.withMessage('Listed building number must be 7 digits'),
	body('changedListedBuilding')
		.contains(/^\d+$/)
		.withMessage('Enter a listed building number using numbers 0 to 9')
]);
