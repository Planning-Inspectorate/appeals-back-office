import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateWithdrawalRequestDate = createValidator(
	body('withdrawal-request-date')
		.trim()
		.notEmpty()
		.withMessage('Please tell us the date on your withdrawal request')
);
export const validateRequestDateFields = createDateInputFieldsValidator(
	'withdrawal-request-date',
	'Withdrawal request date'
);
export const validateRequestDateValid = createDateInputDateValidityValidator(
	'withdrawal-request-date',
	'Withdrawal request date'
);
export const validateDueDateInPastOrToday =
	createDateInputDateInPastOrTodayValidator('withdrawal-request-date');

export const validateRedactionStatus = createValidator(
	body('withdrawal-redaction-status')
		.trim()
		.notEmpty()
		.withMessage('Please select the redaction status')
);

export const validateCheckYourAnswers = createValidator(
	body('confirm-withdrawal')
		.trim()
		.notEmpty()
		.withMessage(
			'Please confirm that the relevant parties can be informed of the appeal withdrawal'
		)
		.bail()
		.equals('yes')
		.withMessage(
			'Please confirm that the relevant parties can be informed of the appeal withdrawal'
		)
);
