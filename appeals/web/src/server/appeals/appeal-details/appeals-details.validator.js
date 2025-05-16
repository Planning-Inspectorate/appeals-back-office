import { createTextareaValidator } from '#lib/validators/textarea-validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

export const validateCaseNoteTextArea = createTextareaValidator(
	'comment',
	'Enter case note',
	textInputCharacterLimits.caseNoteTextInputLength,
	`Case note must be ${textInputCharacterLimits.caseNoteTextInputLength} characters or less`
);
