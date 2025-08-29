import { createValidator } from '@pins/express';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';
import { body } from 'express-validator';

export const validateAppealProcedure = createValidator(
	body('appealProcedure')
		.exists()
		.withMessage('Select the appeal procedure')
		.bail()
		.isIn(Object.values(APPEAL_CASE_PROCEDURE))
		.withMessage('Select the appeal procedure')
);
