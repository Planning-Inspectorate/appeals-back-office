import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaValidator } from '#lib/validators/textarea-validator.js';

export const validateTextArea = createTextareaValidator(
	'developmentDescription',
	'Enter development description',
	textInputCharacterLimits.defaultTextareaLength,
	`Development description must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
