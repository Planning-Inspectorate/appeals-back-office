import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateReviewComments = createValidator(
	body('status')
		.notEmpty()
		.withMessage('Select the outcome of your review')
		.bail()
		.isIn([COMMENT_STATUS.VALID, COMMENT_STATUS.INVALID, COMMENT_STATUS.VALID_REQUIRES_REDACTION])
		.withMessage('Select the outcome of your review')
);
