import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateDetails = createValidator(
	body('inspectorAccessDetails')
		.if(body('inspectorAccessRadio').equals('yes'))
		.notEmpty()
		.withMessage('Provide details when inspector access is required')
);
