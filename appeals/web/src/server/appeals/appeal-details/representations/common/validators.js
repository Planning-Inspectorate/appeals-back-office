import { COMMENT_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateStatus = createValidator(
	body('status')
		.notEmpty()
		.withMessage('Select your review decision')
		.bail()
		.isIn(Object.values(COMMENT_STATUS))
		.withMessage('Select your review decision')
);
