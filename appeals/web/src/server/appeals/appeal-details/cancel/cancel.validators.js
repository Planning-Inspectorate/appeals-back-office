import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateCancelReason = createValidator(
	body('cancelReasonRadio').exists().withMessage('Select why you are cancelling the appeal')
);
