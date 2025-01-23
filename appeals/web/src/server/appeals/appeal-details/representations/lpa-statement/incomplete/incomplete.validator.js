import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateSetNewDate = createValidator(
	body('setNewDate')
		.notEmpty()
		.withMessage('Select yes if you want to allow the LPA to resubmit their statement')
		.bail()
		.isString()
		.isAlpha()
		.withMessage('Something went wrong')
);

