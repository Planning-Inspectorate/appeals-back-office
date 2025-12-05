import { LENGTH_1000 } from '@pins/appeals/constants/support.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateFactsForGround = createValidator(
	body('factsForGround')
		.trim()
		.notEmpty()
		.withMessage((value, { req }) => {
			// @ts-ignore
			return `Enter facts for ground (${req.params.groundRef})`;
		})
		.bail()
		.isLength({ max: LENGTH_1000 })
		.withMessage(`Facts must be ${LENGTH_1000} characters or less`)
);
