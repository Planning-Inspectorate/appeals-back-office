import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const charLimitForTextarea = textInputCharacterLimits.defaultTextareaLength;

export const validateDetails = createValidator(
	body('inspectorAccessDetails')
		.if(body('inspectorAccessRadio').equals('yes'))
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter inspector access details')
		.bail()
		.isLength({ max: charLimitForTextarea })
		.withMessage(`Inspector access details must be ${charLimitForTextarea} characters or less`)
);
