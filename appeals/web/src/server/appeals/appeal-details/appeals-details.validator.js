import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaValidator } from '#lib/validators/textarea-validator.js';

export const validateCaseNoteTextArea = createTextareaValidator(
	'comment',
	'Enter case note',
	textInputCharacterLimits.caseNoteTextInputLength,
	`Case note must be ${textInputCharacterLimits.caseNoteTextInputLength} characters or less`
);
