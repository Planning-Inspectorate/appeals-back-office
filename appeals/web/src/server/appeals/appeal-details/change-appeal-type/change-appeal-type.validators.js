import {
	createDateInputDateBusinessDayValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { changeAppealTypeDateField } from './change-appeal-types.constants.js';

export const validateAppealType = createValidator(
	body('appealType').trim().notEmpty().withMessage('Select the appeal type')
);

export const validateResubmitAppeal = createValidator(
	body('appealResubmit')
		.trim()
		.notEmpty()
		.withMessage('Select yes if the appellant needs to resubmit the appeal')
);

export const validateChangeAppealFinalDate = createValidator(
	body('appealType').trim().notEmpty().withMessage('Select the appeal type')
);

export const validateChangeAppealFinalDateFields = createDateInputFieldsValidator(
	changeAppealTypeDateField,
	'Deadline to resubmit the appeal'
);
export const validateChangeAppealFinalDateValid = createDateInputDateValidityValidator(
	changeAppealTypeDateField,
	'Deadline to resubmit the appeal'
);
export const validateChangeAppealFinalDateInFuture = createDateInputDateInFutureValidator(
	changeAppealTypeDateField,
	'Deadline to resubmit the appeal'
);

export const validateChangeAppealFinalDateIsBusinessDay =
	createDateInputDateBusinessDayValidator(changeAppealTypeDateField);

export const validateHorizonReference = createValidator(
	body('horizon-reference')
		.trim()
		.matches(/^\d{7}$/)
		.withMessage('Enter a valid Horizon appeal reference')
);
