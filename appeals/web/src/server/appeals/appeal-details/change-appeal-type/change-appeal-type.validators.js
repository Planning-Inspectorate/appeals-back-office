import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateBusinessDayValidator
} from '#lib/validators/date-input.validator.js';
import { checkAppealReferenceExistsInHorizon } from './change-appeal-type.service.js';

export const validateAppealType = createValidator(
	body('appealType').trim().notEmpty().withMessage('Please choose an appeal type')
);

export const validateResubmitAppeal = createValidator(
	body('appealResubmit')
		.trim()
		.notEmpty()
		.withMessage('Please specify if the appeal should be resubmitted')
);

export const validateChangeAppealFinalDate = createValidator(
	body('appealType').trim().notEmpty().withMessage('Please choose an appeal type')
);

export const validateChangeAppealFinalDateFields = createDateInputFieldsValidator(
	'change-appeal-final-date',
	'Final date'
);
export const validateChangeAppealFinalDateValid = createDateInputDateValidityValidator(
	'change-appeal-final-date',
	'Final date'
);
export const validateChangeAppealFinalDateInFuture = createDateInputDateInFutureValidator(
	'change-appeal-final-date'
);

export const validateChangeAppealFinalDateIsBusinessDay = createDateInputDateBusinessDayValidator(
	'change-appeal-final-date'
);

export const validateHorizonReference = createValidator(
	body()
		.custom(async (bodyFields, { req }) => {
			if (!('horizon-reference' in bodyFields) || bodyFields['horizon-reference'].length === 0) {
				return Promise.reject();
			}

			try {
				const horizonReferenceValidationResult = await checkAppealReferenceExistsInHorizon(
					req.apiClient,
					bodyFields['horizon-reference']
				);

				if (horizonReferenceValidationResult.caseFound === false) {
					return Promise.reject();
				}

				return horizonReferenceValidationResult.caseFound;
			} catch (/** @type {any} */ error) {
				if (error.response.statusCode === 500) {
					req.body.problemWithHorizon = true;
					return true; // avoids failing validation chain (scenario where Horizon is down is handled by rendering a special error page instead of a validation error)
				}
			}

			return Promise.reject();
		})
		.withMessage('Enter a valid Horizon appeal reference')
);

export const validateCheckTransfer = createValidator(
	body('confirm')
		.notEmpty()
		.withMessage('Confirmation must be provided')
		.bail()
		.equals('yes')
		.withMessage('Something went wrong')
);
