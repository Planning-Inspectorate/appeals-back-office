import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateCancelReason = createValidator(
	body('appealInvalidReasons').exists().withMessage('Select why the appeal is invalid')
);
