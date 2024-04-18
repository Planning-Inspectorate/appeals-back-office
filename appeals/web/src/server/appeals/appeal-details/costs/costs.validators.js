import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAddDocumentType = createValidator(
	body('costs-document-type').notEmpty().withMessage('Select a document type')
);
