import { createValidator } from '@pins/express';
import { createDateInputFieldsValidator } from '#lib/validators/date-input.validator.js';
import { createDateInputDateValidityValidator } from '#lib/validators/date-input.validator.js';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { createDateInputDateInFutureValidator } from '#lib/validators/date-input.validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createPostcodeValidator } from '#lib/validators/address.validator.js';
import { capitalize } from 'lodash-es';
import { body } from 'express-validator';

import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';

export const validateYesNoInput = createYesNoRadioValidator(
	'inquiryEstimationYesNo',
	'Select yes if you know the expected number of days to carry out the inquiry'
);

export const validateEstimationInput = createValidator(
	body('inquiryEstimationDays')
		.if(body('inquiryEstimationYesNo').notEmpty().bail())
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

export const validateAddressKnown = createYesNoRadioValidator(
	'addressKnown',
	'Select yes if you know the address of where the inquiry will take place'
);

const maxLength = textInputCharacterLimits.defaultAddressInputLength;

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

export const validateInquiryDateTime = createValidator(
	createDateInputFieldsValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateValidityValidator('inquiry-date', 'Inquiry date'),
	createDateInputDateInFutureValidator('inquiry-date', 'Inquiry date'),
	createTimeInputValidator('inquiry-time', 'inquiry time')
);
