import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const TEXTAREA_MAX_CHARACTERS = 1000;

/**
 * Normalizes textarea input so that line endings (\r\n) are converted to \n
 * and leading/trailing whitespace is trimmed.
 * This ensures consistent character counts between client (GOV.UK counter)
 * and server-side validators.
 *
 * @param {string} value - The textarea input
 * @returns {string} Normalized value
 */
function normalizeTextareaInput(value) {
	if (typeof value !== 'string') return value;
	return value.replace(/\r\n/g, '\n').trim();
}

export const createTextareaValidator = (
	fieldName = 'textarea',
	emptyErrorMessage = 'Enter text',
	maxCharactersAllowed = TEXTAREA_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXTAREA_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.customSanitizer(normalizeTextareaInput)
			.isLength({ min: 1 })
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);

export const createTextareaCharacterValidator = (
	fieldName = 'textarea',
	emptyErrorMessage = 'Enter text',
	maxCharactersAllowed = TEXTAREA_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXTAREA_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.customSanitizer(normalizeTextareaInput)
			.isLength({ min: 1 })
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
			.isAscii()
			.withMessage(
				'Correction notice must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes'
			)
	);

export const createTextareaOptionalValidator = (
	fieldName = 'textarea',
	maxCharactersAllowed = TEXTAREA_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXTAREA_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.customSanitizer(normalizeTextareaInput)
			.bail()
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);

export const createTextareaConditionalValidator = (
	fieldName = 'textarea',
	conditionalFieldName = 'radio',
	conditionalFieldValue = 'yes',
	emptyErrorMessage = 'Enter text',
	maxCharactersAllowed = TEXTAREA_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXTAREA_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.if(body(conditionalFieldName).equals(conditionalFieldValue))
			.customSanitizer(normalizeTextareaInput)
			.isLength({ min: 1 })
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);
