import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateProcedurePreferenceDetails = createValidator(
	body('procedurePreferenceDetailsTextarea')
		.trim()
		.isLength({ min: 0, max: 1000 })
		.withMessage('Text must contain 1000 characters or less')
);

export const validateProcedurePreferenceDuration = createValidator(
	body('procedurePreferenceDurationInput')
		.trim()
		.notEmpty()
		.withMessage('Provide the expected length of procedure')
		.bail()
		.isNumeric()
		.withMessage('Expected length of procedure must be a number')
		.bail()
		.isInt({ min: 0, max: 9 })
		.withMessage('Expected length of procedure must be a number between 0 and 9')
);

export const validateInquiryNumberOfWitnesses = createValidator(
	body('inquiryNumberOfWitnessesInput')
		.trim()
		.notEmpty()
		.withMessage('Provide the expected number of witnesses')
		.bail()
		.isNumeric()
		.withMessage('Expected number of witnesses must be a number')
		.bail()
		.isInt({ min: 0, max: 9 })
		.withMessage('Expected number of witnesses must be a number between 0 and 9')
);
