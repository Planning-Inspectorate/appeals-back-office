import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { INTEREST_IN_LAND } from '#lib/constants.js';
import { createTextareaConditionalValidator } from '#lib/validators/textarea-validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateIncompleteReason = createValidator(
	body('interestInLandRadio')
		.notEmpty()
		.withMessage('What is your interest in the land?')
		.bail()
		.isIn([...INTEREST_IN_LAND, 'other'])
		.withMessage('Something went wrong')
);

export const validateOtherInterestInLand = createTextareaConditionalValidator(
	'interestInLandOther',
	'interestInLandRadio',
	'other',
	'What is your interest in the land?',
	textInputCharacterLimits.defaultTextareaLength,
	`Your interest in the land must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
