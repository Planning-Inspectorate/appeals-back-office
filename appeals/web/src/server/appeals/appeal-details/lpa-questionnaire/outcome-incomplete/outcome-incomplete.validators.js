import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import {
	createDateInputDateBusinessDayValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateIncompleteReason = createValidator(
	body('incompleteReason')
		.exists()
		.withMessage('Please select one or more reasons why the LPA questionnaire is incomplete')
		.bail()
		.notEmpty()
		.withMessage('Please select one or more reasons why the LPA questionnaire is incomplete')
);

export const validateIncompleteReasonTextItems =
	createCheckboxTextItemsValidator('incompleteReason');
export const validateDueDateFields = createDateInputFieldsValidator('due-date');
export const validateDueDateValid = createDateInputDateValidityValidator('due-date');
export const validateDueDateInFuture = createDateInputDateInFutureValidator('due-date');
export const validateDueDateIsBusinessDay = createDateInputDateBusinessDayValidator('due-date');
