import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaValidator } from '#lib/validators/textarea-validator.js';

export const validateTextArea = createTextareaValidator(
	'advertisementDescription',
	'Enter advertisement description',
	textInputCharacterLimits.defaultTextareaLength,
	`Advertisement description must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
