import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeIsCommunityInfrastructureLevyFormallyAdopted = createValidator(
	body('isInfrastructureLevyFormallyAdoptedRadio')
		.notEmpty()
		.withMessage('Select whether levy formally adopted')
		.bail()
);
