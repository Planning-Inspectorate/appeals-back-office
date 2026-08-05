import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaValidator } from '#lib/validators/textarea-validator.js';

export const validateTextArea = createTextareaValidator(
	'reasonForAppealAppellant',
	'Enter reason for appeal',
	textInputCharacterLimits.expandedTextareaLength,
	`Reason for appeal must be ${textInputCharacterLimits.expandedTextareaLength} characters or less`
);
