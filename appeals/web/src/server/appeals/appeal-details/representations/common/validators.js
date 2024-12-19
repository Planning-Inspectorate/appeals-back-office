import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateStatus = createValidator(
	body('status')
		.notEmpty()
		.withMessage('Select the outcome of your review')
		.bail()
		.isIn(Object.values(COMMENT_STATUS))
		.withMessage('Select the outcome of your review')
);
