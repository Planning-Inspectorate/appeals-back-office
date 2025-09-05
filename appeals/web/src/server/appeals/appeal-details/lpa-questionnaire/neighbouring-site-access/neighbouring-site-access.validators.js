import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createTextareaConditionalValidator } from '#lib/validators/textarea-validator.js';

export const validateNeighbouringSiteAccessTextArea = createTextareaConditionalValidator(
	'neighbouringSiteAccess',
	'neighbouringSiteAccessRadio',
	'yes',
	'Enter the reason',
	textInputCharacterLimits.defaultTextareaLength,
	`Reason must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
