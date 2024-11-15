import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const TEXT_INPUT_MAX_CHARACTERS = 300;

export const createTextInputValidator = (
	fieldName = 'text',
	emptyErrorMessage = 'Enter text',
	maxCharactersAllowed = TEXT_INPUT_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXT_INPUT_MAX_CHARACTERS} characters or less`
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

export const createTextInputOptionalValidator = (
	fieldName = 'text',
	maxCharactersAllowed = TEXT_INPUT_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXT_INPUT_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.trim()
			.bail()
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);
