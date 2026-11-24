import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeStatus = createValidator(
	body('status').notEmpty().withMessage('Select an appeal status')
);
