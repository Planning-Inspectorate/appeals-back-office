import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const charLimitForTextarea = textInputCharacterLimits.defaultTextareaLength;

export const validateChangeSafetyRisks = createValidator(
	body('safetyRisksDetails')
		.if(body('safetyRisksRadio').equals('yes'))
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter health and safety risks')
		.bail()
		.isLength({ max: charLimitForTextarea })
		.withMessage(`Health and safety risks must be ${charLimitForTextarea} characters or less`)
);
