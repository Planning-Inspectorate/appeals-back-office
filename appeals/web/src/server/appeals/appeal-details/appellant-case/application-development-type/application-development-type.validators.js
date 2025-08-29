import { APPEAL_DEVELOPMENT_TYPES } from '@pins/appeals/constants/appellant-cases.constants.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const allowedDevelopmentTypes = APPEAL_DEVELOPMENT_TYPES.map(
	(/** @type {{value: string}} */ { value }) => value
);

export const validateDevelopmentTypePresent = createValidator([
	body('developmentType').exists({ checkFalsy: true }).withMessage('Select a development type'),

	body('developmentType')
		.isIn(allowedDevelopmentTypes)
		.withMessage('Select a valid development type from the list')
]);
