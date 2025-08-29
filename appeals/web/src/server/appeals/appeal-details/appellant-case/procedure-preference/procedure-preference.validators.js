import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaOptionalValidator } from '#lib/validators/textarea-validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateProcedurePreferenceDetails = createTextareaOptionalValidator(
	'procedurePreferenceDetailsTextarea',
	textInputCharacterLimits.defaultTextareaLength,
	`Reason for preference must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);

export const validateProcedurePreferenceDuration = createValidator(
	body('procedurePreferenceDurationInput')
		.trim()
		.notEmpty()
		.withMessage('Enter the expected length of procedure')
		.bail()
		.isNumeric()
		.withMessage('Expected length of procedure must be a number')
		.bail()
		.isInt({ min: 0, max: 99 })
		.withMessage('Expected length of procedure must be a number between 0 and 99')
);

export const validateInquiryNumberOfWitnesses = createValidator(
	body('inquiryNumberOfWitnessesInput')
		.trim()
		.notEmpty()
		.withMessage('Enter the expected number of witnesses')
		.bail()
		.isNumeric()
		.withMessage('Expected number of witnesses must be a number')
		.bail()
		.isInt({ min: 0, max: 99 })
		.withMessage('Expected number of witnesses must be a number between 0 and 99')
);
