import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInPastOrTodayValidator
} from '#lib/validators/date-input.validator.js';

export const validateValidDateFields = createDateInputFieldsValidator('due-date');
export const validateValidDateValid = createDateInputDateValidityValidator('due-date');
export const validateValidDateInPastOrToday = createDateInputDateInPastOrTodayValidator('due-date');
