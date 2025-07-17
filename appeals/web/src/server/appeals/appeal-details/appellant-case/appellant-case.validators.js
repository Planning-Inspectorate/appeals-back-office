import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateReviewOutcome = createValidator(
	body('reviewOutcome').trim().notEmpty().withMessage('Select the outcome of your review')
);
