import { createValidator } from '@pins/express';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createPostcodeValidator } from '#lib/validators/address.validator.js';
import {
	createDateInputFieldsValidator,
	createDateInputDateValidityValidator,
	createDateInputDateInFutureValidator,
	createDateInputDateBusinessDayValidator,
	extractAndProcessDateErrors
} from '#lib/validators/date-input.validator.js';
import { capitalize } from 'lodash-es';
import { body } from 'express-validator';

import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';

const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateInquiryDateTime = createValidator(
	createDateInputFieldsValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateValidityValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateInFutureValidator('inquiry-date', 'Inquiry date'),
	createTimeInputValidator('inquiry-time', 'inquiry time')
);

export const validateAddressKnown = createYesNoRadioValidator(
	'addressKnown',
	'Select yes if you know the address of where the inquiry will take place'
);

export const validateInquiryAddress = createValidator(
	createAddressLine1Validator(),
	createAddressLine2Validator(),
	createTownValidator(),
	createTextInputOptionalValidator(
		'county',
		maxLength,
		`County must be ${maxLength} characters or less`
	),
	createPostcodeValidator()
);

export const validateYesNoInput = createYesNoRadioValidator(
	'inquiryEstimationYesNo',
	'Select yes if you know the expected number of days to carry out the inquiry'
);

export const validateEstimationInput = createValidator(
	body('inquiryEstimationDays')
		.if(body('inquiryEstimationYesNo').equals('yes'))
		.trim()
		.notEmpty()
		.withMessage(capitalize('Enter the expected number of days to carry out the inquiry'))
		.bail()
		.isNumeric()
		.withMessage(capitalize('Enter the number of days using numbers 0 to 99'))
		.bail()
		.isFloat({ min: 0, max: 99 })
		.withMessage(capitalize('Enter the number of days using numbers 0 to 99'))
		.bail()
		.custom((value) => {
			const floatValue = parseFloat(value);
			return floatValue % 0.5 === 0;
		})
		.withMessage(capitalize('Number of days must be a whole or half number, like 3 or 3.5'))
);

/**
 * @type {import('express').RequestHandler}
 */
export const runDueDateDaysValidator = async (req, res, next) => {
	if (req.errored) {
		next();
		return;
	}
	const validators = dueDateDaysInputValidator();
	let index = 0;
	// @ts-ignore
	const runNext = (err) => {
		if (err) return next(err);
		const validator = validators[index++];
		if (!validator) return next();
		validator(req, res, runNext);
	};
	runNext();
};

/**
 * @param {string} fieldName
 * @param {string} label
 * @returns
 */
export const createDueDateValidators = (fieldName, label) => [
	createDateInputFieldsValidator(fieldName, label),
	createDateInputDateValidityValidator(fieldName, label),
	createDateInputDateInFutureValidator(fieldName, label),
	createDateInputDateBusinessDayValidator(fieldName, label)
];

/**
 * @returns {import('express').RequestHandler[]}
 */
export const dueDateDaysInputValidator = () => {
	/** @type {import('express').RequestHandler[]} */
	const validatorsList = [];
	const validatorsMap = {
		lpaQuestionnaireDueDate: {
			id: 'lpa-questionnaire-due-date',
			label: 'LPA questionnaire due date'
		},
		statementDueDate: {
			id: 'statement-due-date',
			label: 'Statement due date'
		},
		ipCommentsDueDate: {
			id: 'ip-comments-due-date',
			label: 'Interested party comments due date'
		},
		proofsOfEvidenceDueDate: {
			id: 'proof-of-evidence-and-witnesses-due-date',
			label: 'Proof of evidence and witnesses due date'
		},
		statementOfCommonGroundDueDate: {
			id: 'statement-of-common-ground-due-date',
			label: 'Statement of common ground due date'
		},
		planningObligationDueDate: {
			id: 'planning-obligation-due-date',
			label: 'Planning obligation due date'
		}
	};

	Object.values(validatorsMap).forEach((validatorType) => {
		validatorsList.push(...createDueDateValidators(validatorType.id, validatorType.label));
	});

	validatorsList.push(
		extractAndProcessDateErrors({
			fieldNamePrefix: 'lpa-questionnaire-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'statement-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'ip-comments-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'proof-of-evidence-and-witnesses-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'statement-of-common-ground-due-date'
		}),
		extractAndProcessDateErrors({
			fieldNamePrefix: 'planning-obligation-due-date'
		})
	);
	return validatorsList;
};
