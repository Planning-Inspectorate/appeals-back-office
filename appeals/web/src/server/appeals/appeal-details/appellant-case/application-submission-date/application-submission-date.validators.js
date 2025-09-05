import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
export const validateDueDateFields = createDateInputFieldsValidator('application-submission-date');
export const validateDueDateValid = createDateInputDateValidityValidator(
	'application-submission-date'
);
export const validateDueDateInPastOrToday = createDateInputDateInPastOrTodayValidator(
	'application-submission-date'
);
