import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateUser = (isInspector = false) =>
	createValidator(
		body('user')
			.trim()
			.notEmpty()
			.withMessage(
				isInspector
					? 'Enter a inspectors’s name or email address'
					: 'Enter a case officer’s name or email address'
			)
	);
