import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
export const validateDueDateFields = createDateInputFieldsValidator(
	'contact-planning-inspectorate-date',
	'The date you contacted the Planning Inspectorate'
);
export const validateDueDateValid = createDateInputDateValidityValidator(
	'contact-planning-inspectorate-date',
	'The date you contacted the Planning Inspectorate'
);
export const validateDueDateInPastOrToday = createDateInputDateInPastOrTodayValidator(
	'contact-planning-inspectorate-date',
	'date you contacted the Planning Inspectorate'
);
