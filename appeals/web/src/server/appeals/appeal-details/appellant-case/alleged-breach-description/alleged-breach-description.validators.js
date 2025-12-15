import { LENGTH_1000 } from '@pins/appeals/constants/support.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAllegedBreachDescription = createValidator(
	body('descriptionOfAllegedBreach')
		.trim()
		.notEmpty()
		.withMessage(`Enter a description`)
		.bail()
		.isLength({ max: LENGTH_1000 })
		.withMessage(`Your description must be ${LENGTH_1000} characters or less`)
);
