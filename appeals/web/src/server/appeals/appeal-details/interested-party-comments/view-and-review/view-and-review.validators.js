import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateReviewComment = createValidator(
	body('status').notEmpty().isIn(['valid', 'invalid']).withMessage('Something went wrong')
);

export const validateRejectReason = createValidator(
	body('rejectionReason')
		.exists()
		.withMessage('Please select one or more reasons why the comment is invalid')
		.bail()
		.notEmpty()
		.withMessage('Please select one or more reasons why the comment is invalid')
);

export const validateRejectionReasonTextItems = createCheckboxTextItemsValidator(
	'rejectionReason',
	'appellantCaseNotValidReason'
);
