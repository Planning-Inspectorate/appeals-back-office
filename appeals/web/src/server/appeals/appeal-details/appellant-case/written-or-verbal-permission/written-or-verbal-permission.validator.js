import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateWrittenOrVerbalPermission = createValidator(
	body('writtenOrVerbalPermission')
		.notEmpty()
		.withMessage('Select yes if you have written or verbal permission to use the land')
		.bail()
		.isIn(['yes', 'no'])
		.withMessage('There is a problem')
);
