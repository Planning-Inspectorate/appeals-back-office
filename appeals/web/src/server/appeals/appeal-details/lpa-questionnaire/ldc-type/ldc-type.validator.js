import { createValidator } from '@pins/express';
import { APPEAL_APPEAL_UNDER_ACT_SECTION } from '@planning-inspectorate/data-model';
import { body } from 'express-validator';

export const validateIncompleteReason = createValidator(
	body('appealUnderActSection')
		.notEmpty()
		.withMessage('Select what type of lawful development certificate the appeal is about')
		.bail()
		.isIn([...Object.values(APPEAL_APPEAL_UNDER_ACT_SECTION)])
		.withMessage('Something went wrong')
);
