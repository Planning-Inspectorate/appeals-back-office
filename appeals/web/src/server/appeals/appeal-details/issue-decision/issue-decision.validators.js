import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
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

export const validateDecisionLetterDate = createValidator(
	body('decision-letter-date')
		.trim()
		.notEmpty()
		.withMessage('Please tell us the date on your decision letter')
);

export const validateVisitDateFields = createDateInputFieldsValidator(
	'decision-letter-date',
	'Decision letter date'
);

export const validateVisitDateValid = createDateInputDateValidityValidator(
	'decision-letter-date',
	'Decision letter date'
);

export const validateDueDateInPastOrToday =
	createDateInputDateInPastOrTodayValidator('decision-letter-date');

export const validateCheckDecision = createValidator(
	body('ready-to-send')
		.trim()
		.notEmpty()
		.withMessage('Please confirm that the decision is ready to be sent to all parties')
		.bail()
		.equals('yes')
		.withMessage('Please confirm that the decision is ready to be sent to all parties')
);
