import { createTextareaValidator } from '#lib/validators/textarea-validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

export const validateCaseNoteTextArea = createTextareaValidator(
	'comment',
	'Enter case note',
	textInputCharacterLimits.defaultInputLength,
	`Case note must be ${textInputCharacterLimits.defaultInputLength} characters or less`
);
