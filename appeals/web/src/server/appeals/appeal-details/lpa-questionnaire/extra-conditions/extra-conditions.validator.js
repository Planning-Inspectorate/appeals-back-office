import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const charLimitForTextarea = textInputCharacterLimits.expandedTextareaLength;

export const validateChangeExtraConditions = createValidator(
	body('extraConditionsDetails')
		.if(body('extraConditionsRadio').equals('yes'))
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter new conditions details')
		.bail()
		.isLength({ max: charLimitForTextarea })
		.withMessage(`New conditions must be ${charLimitForTextarea} characters or less`)
);
