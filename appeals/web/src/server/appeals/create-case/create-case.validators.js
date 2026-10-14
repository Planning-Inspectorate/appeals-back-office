import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { GENERIC_APPEAL_TYPES } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	errorMessageInvalidDate,
	errorMessageNoDateEntered,
	errorMessageSelectCaseType,
	fieldNameCaseType,
	fieldNameSubmissionDate
} from './create-case.constants.js';

export const validateCaseType = createValidator(
	body(fieldNameCaseType)
		.notEmpty()
		.withMessage(errorMessageSelectCaseType)
		.bail()
		.isIn(Object.values(GENERIC_APPEAL_TYPES))
		.withMessage(errorMessageSelectCaseType)
);

export const validateSubmissionDateFields = createDateInputFieldsValidator(
	fieldNameSubmissionDate,
	'appeal submitted date'
);

export const validateSubmissionDateValid = createDateInputDateValidityValidator(
	fieldNameSubmissionDate,
	'appeal submitted date'
);

export const validateSubmissionDateInPastOrToday = createDateInputDateInPastOrTodayValidator(
	fieldNameSubmissionDate,
	'appeal submitted date'
);

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const overrideDateErrorMessage = (req, res, next) => {
	if (req.errors) {
		const dayKey = `${fieldNameSubmissionDate}-day`;
		const monthKey = `${fieldNameSubmissionDate}-month`;
		const yearKey = `${fieldNameSubmissionDate}-year`;

		for (const key of [dayKey, monthKey, yearKey, fieldNameSubmissionDate]) {
			if (req.errors[key]) {
				if (req.errors[key].msg === 'Enter the appeal submitted date') {
					req.errors[key].msg = errorMessageNoDateEntered;
				} else {
					req.errors[key].msg = errorMessageInvalidDate;
				}
			}
		}
	}
	next();
};
