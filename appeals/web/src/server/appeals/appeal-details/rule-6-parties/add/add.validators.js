import { createEmailInputValidator } from '#lib/validators/email-input.validator.js';
import {
	createTextInputValidator,
	TEXT_INPUT_MAX_CHARACTERS
} from '#lib/validators/text-input-validator.js';

export const validateName = createTextInputValidator(
	'organisationName',
	'Enter a name',
	TEXT_INPUT_MAX_CHARACTERS,
	`Name must be ${TEXT_INPUT_MAX_CHARACTERS} characters or less`
);

export const validateEmail = createEmailInputValidator();
