import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { ALLOCATION_LEVELS } from './valid.mapper.js';

export const validateAllocationLevel = createValidator(
	body('allocationLevel')
		.notEmpty()
		.withMessage('Select allocation level')
		.bail()
		.isIn(ALLOCATION_LEVELS)
		.withMessage('Something went wrong')
);
