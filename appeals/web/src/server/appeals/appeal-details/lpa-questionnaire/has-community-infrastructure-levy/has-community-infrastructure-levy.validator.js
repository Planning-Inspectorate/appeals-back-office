import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeHasCommunityInfrastructureLevy = createValidator(
	body('hasCommunityInfrastructureLevyRadio')
		.notEmpty()
		.withMessage('Select community infrastructure levy status')
		.bail()
);
