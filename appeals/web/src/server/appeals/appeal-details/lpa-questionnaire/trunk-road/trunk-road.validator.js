import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const charLimitForTextarea = textInputCharacterLimits.expandedTextareaLength;

export const validateChangeTrunkRoad = createValidator(
	body('trunkRoadDetails')
		.if(body('trunkRoadRadio').equals('yes'))
		.trim()
		.isLength({ min: 1 })
		.withMessage('Enter trunk road name')
		.bail()
		.isLength({ max: charLimitForTextarea })
		.withMessage(`Trunk road name must be ${charLimitForTextarea} characters or less`)
);
