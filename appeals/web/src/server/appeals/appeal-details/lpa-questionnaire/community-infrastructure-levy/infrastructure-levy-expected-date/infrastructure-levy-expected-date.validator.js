import {
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
export const validateDueDateFields = createDateInputFieldsValidator('levy-expected-date');
export const validateDueDateValid = createDateInputDateValidityValidator('levy-expected-date');
