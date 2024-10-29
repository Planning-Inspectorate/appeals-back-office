import { createTextareaValidator } from '#lib/validators/textarea-validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

export const validateTextArea = createTextareaValidator(
	'developmentDescription',
	'Enter development description',
	textInputCharacterLimits.defaultTextareaLength,
	`Development description must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
