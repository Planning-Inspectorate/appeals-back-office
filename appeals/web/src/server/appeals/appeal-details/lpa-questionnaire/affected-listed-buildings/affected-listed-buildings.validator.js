import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateAffectedListedBuilding = createValidator(
	body('affectedListedBuilding')
		.notEmpty()
		.withMessage('Provide a listed building entry list number')
);
