import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateReviewOutcome = createValidator(
	body('review-outcome').trim().notEmpty().withMessage('Review outcome must be provided')
);

export const validateEiaScreeningRequired = createYesNoRadioValidator(
	'eiaScreeningRequired',
	'Select yes if the environmental services team need to review the case'
);
