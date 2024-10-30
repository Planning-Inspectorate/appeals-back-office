import {
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateCheckAddress = createValidator(
	body('addressProvided')
		.exists()
		.withMessage('Please indicate whether the interested party provided an address.')
);

export const validateRedactionStatus = createValidator(
	body('redactionStatus').exists().withMessage('Please select a redaction status.')
);

export const validateCommentSubmittedDateFields = createDateInputFieldsValidator(
	'date',
	'submitted date'
);
export const validateCommentSubmittedDateValid = createDateInputDateValidityValidator(
	'date',
	'submitted date'
);
