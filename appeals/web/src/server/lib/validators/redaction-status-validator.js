import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateRedactionStatus = createValidator(
	body('withdrawal-redaction-status')
		.trim()
		.notEmpty()
		.withMessage('Please select the redaction status')
);
