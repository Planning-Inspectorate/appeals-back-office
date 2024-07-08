import {
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';

export const validateDateFields = createDateInputFieldsValidator('application-decision-date');
export const validateDateValid = createDateInputDateValidityValidator('application-decision-date');
