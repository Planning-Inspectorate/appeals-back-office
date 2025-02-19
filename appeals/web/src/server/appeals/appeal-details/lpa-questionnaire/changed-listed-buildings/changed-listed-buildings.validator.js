import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangedListedBuilding = createValidator(
	body('changedListedBuilding')
		.notEmpty()
		.withMessage('Provide a listed building entry list number')
);
