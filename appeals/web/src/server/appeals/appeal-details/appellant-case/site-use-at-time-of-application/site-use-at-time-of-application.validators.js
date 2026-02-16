import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaValidator } from '#lib/validators/textarea-validator.js';

export const validateTextArea = createTextareaValidator(
	'siteUseAtTimeOfApplication',
	'Enter appeal site use at time of application',
	textInputCharacterLimits.defaultTextareaLength,
	`Appeal site use at time of application must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
