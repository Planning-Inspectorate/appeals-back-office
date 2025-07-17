import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';

export const validateInvalidReason = createValidator(
	body('invalidReason')
		.exists()
		.withMessage('Select why the appeal is invalid')
		.bail()
		.notEmpty()
		.withMessage('Select why the appeal is invalid')
);

export const validateInvalidReasonTextItems = createCheckboxTextItemsValidator('invalidReason');
