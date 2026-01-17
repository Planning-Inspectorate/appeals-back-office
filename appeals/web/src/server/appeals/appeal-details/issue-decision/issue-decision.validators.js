import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { isFeatureActive } from '#common/feature-flags.js';
import {
	createTextareaConditionalValidator,
	createTextareaValidator
} from '#lib/validators/textarea-validator.js';
import { FEATURE_FLAG_NAMES } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateDecision = createValidator(
	body('decision').trim().notEmpty().withMessage('Select the decision')
);

export const validateDecisionLetter = createValidator(
	body('decisionLetter')
		.trim()
		.notEmpty()
		.withMessage('Select yes if you want to issue a decision letter')
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

export const validateInvalidReason = isFeatureActive(FEATURE_FLAG_NAMES.INVALID_DECISION_LETTER)
	? createTextareaValidator(
			'invalidReason',
			'Enter reason',
			textInputCharacterLimits.defaultTextareaLength,
			`Reason must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
		)
	: createTextareaConditionalValidator(
			'invalidReason',
			'decision',
			'invalid',
			'Enter a reason',
			textInputCharacterLimits.defaultTextareaLength,
			`Reason must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
		);
