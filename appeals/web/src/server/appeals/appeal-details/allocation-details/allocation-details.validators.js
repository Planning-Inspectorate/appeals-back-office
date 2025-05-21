import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAllocationDetailsLevels = createValidator(
	body('allocation-level').trim().notEmpty().withMessage('Select the allocation level')
);

export const validateAllocationDetailsSpecialisms = createValidator(
	body('allocation-specialisms')
		.exists()
		.withMessage('Select the allocation specialisms')
		.bail()
		.notEmpty()
		.withMessage('Select the allocation specialisms')
);
