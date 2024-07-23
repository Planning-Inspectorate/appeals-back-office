import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateMultilineString = createValidator(
	body('developmentDescription')
		.trim()
		.notEmpty()
		.withMessage('Development description cannot be empty')
		.bail()
		.isLength({ max: 1000 })
		.withMessage('Text must contain 1000 characters or less')
);
