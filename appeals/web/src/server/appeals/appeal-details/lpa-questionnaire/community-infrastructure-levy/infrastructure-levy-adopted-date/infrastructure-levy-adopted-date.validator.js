import {
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
export const validateDueDateFields = createDateInputFieldsValidator('levy-adopted-date');
export const validateDueDateValid = createDateInputDateValidityValidator('levy-adopted-date');
