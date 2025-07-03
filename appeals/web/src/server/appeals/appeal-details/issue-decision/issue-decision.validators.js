import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { createTextareaConditionalValidator } from '#lib/validators/textarea-validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

export const validateDecision = createValidator(
	body('decision').trim().notEmpty().withMessage('Select the decision')
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

export const validateInvalidReason = createTextareaConditionalValidator(
	'invalidReason',
	'decision',
	'Invalid',
	'Enter a reason',
	textInputCharacterLimits.defaultTextareaLength,
	`Reason must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
