import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeExtraConditions = createValidator(
	body('extraConditionsDetails')
		.if(body('extraConditionsRadio').equals('yes'))
		.notEmpty()
		.withMessage('Provide details of the extra conditions')
		.bail()
		.isLength({ max: 1000 })
		.withMessage('Extra conditions details must contain 1000 characters or less')
);
