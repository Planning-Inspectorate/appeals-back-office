import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateCheckAddress = createValidator(
	body('addressProvided')
		.exists()
		.withMessage('Please indicate whether the interested party provided an address.')
);
