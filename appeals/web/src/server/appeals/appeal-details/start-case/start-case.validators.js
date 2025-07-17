import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { APPEAL_CASE_PROCEDURE } from '@planning-inspectorate/data-model';

export const validateAppealProcedure = createValidator(
	body('appealProcedure')
		.exists()
		.withMessage('Select the appeal procedure')
		.bail()
		.isIn(Object.values(APPEAL_CASE_PROCEDURE))
		.withMessage('Select the appeal procedure')
);
