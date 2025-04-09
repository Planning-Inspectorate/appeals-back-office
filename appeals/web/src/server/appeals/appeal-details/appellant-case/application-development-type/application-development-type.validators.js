import { body } from 'express-validator';
import { createValidator } from '@pins/express';
import { APPEAL_DEVELOPMENT_TYPES } from './appeal-development-type.constants.js';

const allowedDevelopmentTypes = APPEAL_DEVELOPMENT_TYPES.map(({ value }) => value);

export const validateDevelopmentTypePresent = createValidator([
	body('developmentType').exists({ checkFalsy: true }).withMessage('Select a development type'),

	body('developmentType')
		.isIn(allowedDevelopmentTypes)
		.withMessage('Select a valid development type from the list')
]);
