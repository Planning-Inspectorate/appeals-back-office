import { createEmailInputValidator } from '#lib/validators/email-input.validator.js';
import {
	createTextInputValidatorMinMax,
	TEXT_INPUT_MAX_CHARACTERS,
	TEXT_INPUT_MIN_CHARACTERS
} from '#lib/validators/text-input-validator.js';

export const validateName = createTextInputValidatorMinMax(
	'organisationName',
	'Enter a Rule 6 party name',
	TEXT_INPUT_MAX_CHARACTERS,
	TEXT_INPUT_MIN_CHARACTERS,
	/^[A-Za-z .,'!&-]+$/,
	`The name must be between ${TEXT_INPUT_MIN_CHARACTERS} and ${TEXT_INPUT_MAX_CHARACTERS} characters`,
	`The name must not include numbers`
);

export const validateEmail = createEmailInputValidator(
	'email',
	'Enter a Rule 6 party email address'
);
