import { createTextInputValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateSiteArea = createValidator(
	createTextInputValidator(
		'siteArea',
		'Enter the site area',
		9,
		`Site area must be 9 characters or less`
	),
	body('siteArea').trim().isNumeric().withMessage('Site area must be a number or decimal')
);
