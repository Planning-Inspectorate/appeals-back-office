import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateListDocumentsBeforeDecision = createValidator(
	body(['listDocumentsBeforeDecisionTextarea'])
		.trim()
		.isLength({ min: 1, max: 8000 })
		.withMessage('Text must contain 8000 characters or less')
);
