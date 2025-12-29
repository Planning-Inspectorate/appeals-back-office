import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateDevelopmentAllOrPartPresent = createValidator([
	body('applicationDevelopmentAllOrPartRadio')
		.isIn(['all-of-the-development', 'part-of-the-development'])
		.withMessage('Select if the application was for all or part of the development')
]);
