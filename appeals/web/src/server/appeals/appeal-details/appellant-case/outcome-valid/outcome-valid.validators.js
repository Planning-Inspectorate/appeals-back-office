import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInPastOrTodayValidator
} from '#lib/validators/date-input.validator.js';

export const validateValidDateFields = createDateInputFieldsValidator('valid-date');
export const validateValidDateValid = createDateInputDateValidityValidator('valid-date');
export const validateValidDateInPastOrToday =
	createDateInputDateInPastOrTodayValidator('valid-date');
