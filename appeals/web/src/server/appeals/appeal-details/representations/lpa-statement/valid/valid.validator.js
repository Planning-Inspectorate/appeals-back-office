import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAllocationLevel = createValidator(
	body('allocationLevel')
		.notEmpty()
		.withMessage('Select allocation level')
		.bail()
		.isString()
		.isAlpha()
		.withMessage('Something went wrong')
);

export const validateAllocationSpecialisms = createValidator(
	body('allocationSpecialisms')
		.notEmpty()
		.withMessage('Select all allocation specialisms that apply')
);
