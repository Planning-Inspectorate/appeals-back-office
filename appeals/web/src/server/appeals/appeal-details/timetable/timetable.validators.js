import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateBusinessDayValidator
} from '#lib/validators/date-input.validator.js';
export const validateLpaqDueDateFields = createDateInputFieldsValidator(
	'lpa-questionnaire-due-date',
	'LPA questionnaire due date'
);
export const validateLpaqDueDateValid = createDateInputDateValidityValidator(
	'lpa-questionnaire-due-date',
	'LPA questionnaire due date'
);
export const validateLpaqDueDateInFuture = createDateInputDateInFutureValidator(
	'lpa-questionnaire-due-date',
	'LPA questionnaire due date'
);
export const validateLpaqDueDateBusinessDay = await createDateInputDateBusinessDayValidator(
	'lpa-questionnaire-due-date',
	'LPA questionnaire due date'
);
