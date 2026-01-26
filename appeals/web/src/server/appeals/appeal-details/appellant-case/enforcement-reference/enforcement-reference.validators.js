import { createTextInputValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';

export const validateEnforcementReference = createValidator(
	createTextInputValidator(
		'enforcementReference',
		'Enter the reference number on the enforcement notice',
		250,
		'Reference number must be 250 characters or less',
		/^[A-Za-z0-9 .,'!&/-]+$/
	)
);
