import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
export const validateDueDateFields = createDateInputFieldsValidator(
	'appeal-decision-date',
	'The decision date'
);
export const validateDueDateValid = createDateInputDateValidityValidator(
	'appeal-decision-date',
	'The decision date'
);
export const validateDueDateInPastOrToday = createDateInputDateInPastOrTodayValidator(
	'appeal-decision-date',
	'The decision date'
);
