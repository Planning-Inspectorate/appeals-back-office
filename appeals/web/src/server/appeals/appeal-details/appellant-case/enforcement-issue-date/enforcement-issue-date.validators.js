import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
export const validateDueDateFields = createDateInputFieldsValidator(
	'enforcement-issue-date',
	'The issue date'
);
export const validateDueDateValid = createDateInputDateValidityValidator(
	'enforcement-issue-date',
	'The issue date'
);
export const validateDueDateInPastOrToday = createDateInputDateInPastOrTodayValidator(
	'enforcement-issue-date',
	'issue date'
);
