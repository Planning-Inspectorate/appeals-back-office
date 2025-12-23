import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateDevelopmentAllOrPartPresent = createValidator([
	body('applicationDevelopmentAllOrPartRadio')
		.isIn(['all', 'part'])
		.withMessage('Select if the application was for all or part of the development')
]);
