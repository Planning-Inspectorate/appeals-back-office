import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateReviewComment = createValidator(
	body('status').notEmpty().isIn(['valid', 'invalid']).withMessage('Something went wrong')
);
