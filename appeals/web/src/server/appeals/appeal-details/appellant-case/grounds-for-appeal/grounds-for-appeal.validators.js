import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateGroundsForAppeal = createValidator(
	body('groundsForAppeal').trim().notEmpty().withMessage('Select your grounds of appeal')
);
