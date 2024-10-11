import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateCaseNoteEntry = createValidator(
	body('comment').trim().notEmpty().withMessage('A case note entry cannot be empty')
);
