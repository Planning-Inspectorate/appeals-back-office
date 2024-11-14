import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateReviewComment = createValidator(
	body('status')
		.notEmpty()
		.isIn([COMMENT_STATUS.VALID, COMMENT_STATUS.INVALID, COMMENT_STATUS.VALID_REQUIRES_REDACTION])
		.withMessage('Something went wrong')
);
