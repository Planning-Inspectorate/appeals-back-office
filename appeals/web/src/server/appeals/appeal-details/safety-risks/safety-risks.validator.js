import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeSafetyRisks = createValidator(
	body('safetyRisksDetails')
		.if(body('safetyRisksRadio').equals('yes'))
		.notEmpty()
		.withMessage('Provide details of health and safety risks')
		.bail()
		.isLength({ max: 1000 })
		.withMessage('Safety risks details must contain 1000 characters or less')
);
