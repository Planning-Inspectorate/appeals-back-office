import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

const charLimitForTextarea = textInputCharacterLimits.defaultTextareaLength;

export const validateChangeExtraConditions = createValidator(
	body('extraConditionsDetails')
		.if(body('extraConditionsRadio').equals('yes'))
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter extra conditions details')
		.bail()
		.isLength({ max: charLimitForTextarea })
		.withMessage(`Extra conditions details must be ${charLimitForTextarea} characters or less`)
);
