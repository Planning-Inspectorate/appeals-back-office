import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateRejectReason = createValidator(
	body('rejectionReason')
		.exists()
		.withMessage('Please select one or more reasons why the comment is invalid')
);

export const validateRejectionReasonTextItems = createCheckboxTextItemsValidator('rejectionReason');

export const validateAllowResubmit = createValidator(
	body('allowResubmit')
		.exists()
		.withMessage('Select yes if you want to allow the interested party to resubmit a comment')
		.isIn(['yes', 'no'])
);
