import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const TEXTAREA_MAX_CHARACTERS = 1000;

export const createTextareaValidator = (
	fieldName = 'textarea',
	emptyErrorMessage = 'Enter text',
	maxCharactersAllowed = TEXTAREA_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXTAREA_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.trim()
			.isLength({ min: 1 })
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);

export const createTextareaOptionalValidator = (
	fieldName = 'textarea',
	maxCharactersAllowed = TEXTAREA_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXTAREA_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.trim()
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
			.trim()
			.isLength({ min: 1 })
			.withMessage(emptyErrorMessage)
			.bail()
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);
