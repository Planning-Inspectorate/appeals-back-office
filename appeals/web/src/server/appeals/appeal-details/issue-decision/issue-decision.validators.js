import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateDecision = createValidator(
	body('decision').trim().notEmpty().withMessage('Select decision')
);

export const validateAppellantCostsDecision = createValidator(
	body('appellantCostsDecision')
		.trim()
		.notEmpty()
		.withMessage("Select yes if you want to issue the appellant's cost decision")
);

export const validateLpaCostsDecision = createValidator(
	body('lpaCostsDecision')
		.trim()
		.notEmpty()
		.withMessage("Select yes if you want to issue the LPA's cost decision")
);
