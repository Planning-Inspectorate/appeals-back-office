import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

const charLimitForTextarea = textInputCharacterLimits.expandedTextareaLength;

export const validateChangeExtraConditions = createValidator(
	body('extraConditionsDetails')
		.if(body('extraConditionsRadio').equals('yes'))
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter the new conditions')
		.bail()
		.isLength({ max: charLimitForTextarea })
		.withMessage(`New conditions must be ${charLimitForTextarea} characters or less`)
		.bail()
		.matches(/^[a-zA-Z0-9\s'-]+$/)
		.withMessage(
			'New conditions must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes'
		)
);
