import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	createDateInputDateInPastOrTodayValidator,
	createDateInputDateValidityValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createTextareaConditionalValidator } from '#lib/validators/textarea-validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateValidDateFields = (/** @type {string} */ messageFieldNamePrefix) =>
	createDateInputFieldsValidator('valid-date', messageFieldNamePrefix);
export const validateValidDateValid = (/** @type {string} */ messageFieldNamePrefix) =>
	createDateInputDateValidityValidator('valid-date', messageFieldNamePrefix);
export const validateValidDateInPastOrToday = (/** @type {string} */ messageFieldNamePrefix) =>
	createDateInputDateInPastOrTodayValidator('valid-date', messageFieldNamePrefix);

export const validateGroundARadio = createValidator(
	body('enforcementGroundARadio')
		.notEmpty()
		.withMessage('Select yes if the appeal is ground (a) barred')
		.bail()
		.isIn(['yes', 'no'])
		.withMessage('Something went wrong')
);

export const validateOtherInformation = createValidator(
	body('otherInformationValidRadio')
		.notEmpty()
		.withMessage('Select yes if you want to add any other information')
		.bail()
		.isIn(['Yes', 'No'])
		.withMessage('Something went wrong')
);

export const validateOtherInterestInLand = createTextareaConditionalValidator(
	'otherInformationDetails',
	'otherInformationValidRadio',
	'Yes',
	'Enter other information',
	textInputCharacterLimits.defaultTextareaLength,
	`Other information must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
