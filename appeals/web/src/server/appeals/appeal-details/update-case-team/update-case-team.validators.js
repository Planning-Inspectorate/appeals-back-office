import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateCaseTeamSelection = createValidator(
	body('case-team').trim().notEmpty().withMessage('Enter a team name or team email address')
);
