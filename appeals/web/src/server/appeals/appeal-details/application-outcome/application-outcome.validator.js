import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeSafetyRisks = createValidator(
	body('applicationOutcomeRadio')
		.isIn(['granted', 'refused', 'not_received'])
		.withMessage('Please select granted, refused or not received')
);
