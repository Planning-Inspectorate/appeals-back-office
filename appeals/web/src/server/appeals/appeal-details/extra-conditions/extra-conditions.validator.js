import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeExtraConditions = createValidator(
	body('extraConditionsDetails')
		.if(body('extraConditionsRadio').equals('yes'))
		.notEmpty()
		.withMessage('Provide details of the extra conditions')
);
