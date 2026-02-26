import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createPostcodeValidator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import {
	createDateInputDateInFutureValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize } from 'lodash-es';

export const validateHearingDateTime = createValidator(
	createDateInputFieldsValidator('hearing-date', 'Hearing date'),
	createDateInputDateValidityValidator('hearing-date', 'Hearing date'),
	createDateInputDateInFutureValidator('hearing-date', 'Hearing date'),
	createTimeInputValidator('hearing-time', 'hearing time')
);

export const validateAddressKnown = createYesNoRadioValidator(
	'addressKnown',
	'Select yes if you know the address of where the hearing will take place'
);

export const validateYesNoInput = createYesNoRadioValidator(
	'hearingEstimationYesNo',
	'Select yes if you know the expected number of days to carry out the hearing'
);

export const validateEstimationInput = createValidator(
	body('hearingEstimationDays')
		.if(body('hearingEstimationYesNo').equals('yes'))
		.trim()
		.notEmpty()
		.withMessage(capitalize('Enter the expected number of days to carry out the hearing'))
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

const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateHearingAddress = createValidator(
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
