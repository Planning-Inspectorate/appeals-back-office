import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAddDocumentType = createValidator(
	body('costs-document-type').notEmpty().withMessage('Select a document type')
);

export const validatePostDecisionConfirmation = createValidator(
	body('confirm')
		.notEmpty()
		.withMessage('Select that you will email the relevant parties')
		.bail()
		.isIn(['yes'])
		.withMessage('Something went wrong')
);