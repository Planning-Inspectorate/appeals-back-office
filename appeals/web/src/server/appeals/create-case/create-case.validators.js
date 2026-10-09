import { GENERIC_APPEAL_TYPES } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { errorMessageSelectCaseType, fieldNameCaseType } from './create-case.constants.js';

export const validateCaseType = createValidator(
	body(fieldNameCaseType)
		.notEmpty()
		.withMessage(errorMessageSelectCaseType)
		.bail()
		.isIn(Object.values(GENERIC_APPEAL_TYPES))
		.withMessage(errorMessageSelectCaseType)
);
