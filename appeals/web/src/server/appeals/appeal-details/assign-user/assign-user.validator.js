import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateUser = (isInspector = false) =>
	createValidator(
		body('user')
			.trim()
			.notEmpty()
			.withMessage(
				isInspector
					? 'Enter an inspector’s name or email address'
					: 'Enter a case officer’s name or email address'
			)
	);
