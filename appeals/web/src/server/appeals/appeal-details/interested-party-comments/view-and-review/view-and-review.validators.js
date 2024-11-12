import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateReviewComment = createValidator(
	body('status')
		.notEmpty()
		.isIn([COMMENT_STATUS.VALID, COMMENT_STATUS.INVALID, COMMENT_STATUS.VALID_REQUIRES_REDACTION])
		.withMessage('Something went wrong')
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

export const validateAllowResubmit = createValidator(
	body('allowResubmit')
		.exists()
		.withMessage('Select yes if you want to allow the interested party to resubmit a comment')
		.isIn(['yes', 'no'])
);
