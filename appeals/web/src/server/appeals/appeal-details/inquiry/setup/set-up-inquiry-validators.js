import { createValidator } from '@pins/express';
import { createDateInputFieldsValidator } from '#lib/validators/date-input.validator.js';
import { createDateInputDateValidityValidator } from '#lib/validators/date-input.validator.js';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { createDateInputDateInFutureValidator } from '#lib/validators/date-input.validator.js';

export const validateInquiryDateTime = createValidator(
	createDateInputFieldsValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateValidityValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateInFutureValidator('inquiry-date', 'Inquiry date'),
	createTimeInputValidator('inquiry-time', 'inquiry time')
);
