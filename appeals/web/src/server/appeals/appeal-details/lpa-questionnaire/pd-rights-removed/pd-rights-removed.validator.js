import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const charLimitForTextarea = textInputCharacterLimits.expandedTextareaLength;

export const validateChangePdRightsRemoved = createValidator(
	body('pdRightsRemoved')
		.if(body('pdRightsRemovedRadio').equals('yes'))
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter what permitted development rights were removed')
		.bail()
		.isLength({ max: charLimitForTextarea })
		.withMessage(
			`What permitted development rights were removed must be ${charLimitForTextarea} characters or less`
		)
);
