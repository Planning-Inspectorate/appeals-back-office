import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import {
	createDateInputDateInFutureValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { LENGTH_250 } from '@pins/appeals/constants/support.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateIncompleteReason = createValidator(
	body('incompleteReason')
		.exists()
		.withMessage('Select why the appeal is incomplete')
		.bail()
		.notEmpty()
		.withMessage('Select why the appeal is incomplete')
);

export const validateIncompleteReasonTextItems =
	createCheckboxTextItemsValidator('incompleteReason');
export const validateDueDateFields = createDateInputFieldsValidator('due-date', 'Appeal due date');
export const validateDueDateValid = createDateInputDateValidityValidator(
	'due-date',
	'Appeal due date'
);
export const validateDueDateInFuture = createDateInputDateInFutureValidator(
	'due-date',
	'Appeal due date'
);

export const validateMissingDocumentReason = createValidator(
	body('missingDocuments')
		.exists()
		.withMessage('Select which documents are missing')
		.bail()
		.notEmpty()
		.withMessage('Select which documents are missing')
);

export const validateMissingDocumentReasonTextItems = createCheckboxTextItemsValidator(
	'missingDocuments',
	LENGTH_250,
	'more information'
);

export const validateFeeRecieptDueDateFields = createDateInputFieldsValidator(
	'fee-receipt-due-date',
	'ground (a) fee receipt due date'
);
export const validateFeeRecieptDueDateValid = createDateInputDateValidityValidator(
	'fee-receipt-due-date',
	'The ground (a) fee receipt due date'
);
export const validateFeeRecieptDueDateInFuture = createDateInputDateInFutureValidator(
	'fee-receipt-due-date',
	'ground (a) fee receipt due date'
);
