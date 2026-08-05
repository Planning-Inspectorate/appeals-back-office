import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateEiaScreeningRadio = createValidator(
	body('eiaScreeningRadio')
		.notEmpty()
		.withMessage(
			'Select yes if the appellant submitted an environmental statement with the application'
		)
		.bail()
		.isIn(['yes', 'no'])
		.withMessage('Something went wrong')
);
