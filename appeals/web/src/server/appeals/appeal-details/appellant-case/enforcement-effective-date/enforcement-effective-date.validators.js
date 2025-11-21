import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
export const validateDueDateFields = createDateInputFieldsValidator(
	'enforcement-effective-date',
	'The effective date'
);
export const validateDueDateValid = createDateInputDateValidityValidator(
	'enforcement-effective-date',
	'The effective date'
);
export const validateDueDateInPastOrToday = createDateInputDateInPastOrTodayValidator(
	'enforcement-effective-date',
	'effective date'
);
