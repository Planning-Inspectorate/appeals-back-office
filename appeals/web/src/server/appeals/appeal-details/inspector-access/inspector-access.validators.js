import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateDetails = createValidator(
	body('inspectorAccessDetails')
		.if(body('inspectorAccessRadio').equals('yes'))
		.notEmpty()
		.withMessage('Provide details when inspector access is required')
		.bail()
		.isLength({ max: 1000 })
		.withMessage('Appellant details must contain 1000 characters or less')
);
