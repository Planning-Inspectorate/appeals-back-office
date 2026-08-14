import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validatePostDecisionConfirmation = createValidator(
	body('confirm')
		.notEmpty()
		.withMessage('Select that you will email the relevant parties')
		.bail()
		.isIn(['yes'])
		.withMessage('Something went wrong')
);

export const validateInviteResponses = createValidator(
	body('invite-responses')
		.notEmpty()
		.withMessage('Select yes if you want to invite responses')
		.bail()
		.isIn(['yes', 'no'])
		.withMessage('Select yes or no')
);
