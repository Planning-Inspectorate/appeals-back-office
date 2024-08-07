import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateSiteArea = createValidator(
	body('siteArea')
		.trim()
		.notEmpty()
		.withMessage('Provide the site area')
		.bail()
		.isNumeric()
		.withMessage('Provide a number or decimal')
);
