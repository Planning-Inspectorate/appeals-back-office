
import { createDateInputFieldsValidator, createDateInputDateValidityValidator } from '#lib/validators/date-input.validator.js';
import { createTimeInputValidator, createStartTimeBeforeEndTimeValidator } from '#lib/validators/time-input.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { siteVisitDateField } from '../site-visits.constants.js';


export const validateKnowDateTime = createValidator(
	body('dateTimeRadio')
		.trim()
		.notEmpty()
		.withMessage('Select yes if you know the date and time of the site visit')
);
export const validateVisitDateFields = createDateInputFieldsValidator(
	siteVisitDateField,
	'Site visit date'
);
export const validateVisitDateValid = createDateInputDateValidityValidator(
	siteVisitDateField,
	'Site visit date'
);
export const validateVisitStartTime = createTimeInputValidator(
	'visit-start-time',
	'start time',
	// @ts-ignore
	(value, { req }) => {
		return req.body['visit-type'] !== 'unaccompanied';
	}
);
export const validateVisitEndTime = createTimeInputValidator(
	'visit-end-time',
	'end time',
	// @ts-ignore
	(value, { req }) => {
		return req.body['visit-type'] === 'accessRequired';
	}
);
export const validateVisitStartTimeBeforeEndTime = createStartTimeBeforeEndTimeValidator(
	'visit-start-time',
	'visit-end-time',
	'start time',
	'end time',
	// @ts-ignore
	(value, { req }) => {
		return (
			req.body['visit-type'] === 'accessRequired' ||
			(req.body['visit-start-time-hour'].length &&
				req.body['visit-start-time-minute'].length &&
				req.body['visit-end-time-hour'].length &&
				req.body['visit-end-time-minute'].length)
		);
	}
);
