import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInPastOrTodayValidator
} from '#lib/validators/date-input.validator.js';

export const validateValidDateFields = createDateInputFieldsValidator('valid-date', 'Valid date');
export const validateValidDateValid = createDateInputDateValidityValidator(
	'valid-date',
	'Valid date'
);
export const validateValidDateInPastOrToday = createDateInputDateInPastOrTodayValidator(
	'valid-date',
	'Valid date'
);
