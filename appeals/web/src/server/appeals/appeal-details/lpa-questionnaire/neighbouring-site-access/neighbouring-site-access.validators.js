import { createTextareaConditionalValidator } from '#lib/validators/textarea-validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

export const validateNeighbouringSiteAccessTextArea = createTextareaConditionalValidator(
	'neighbouringSiteAccess',
	'neighbouringSiteAccessRadio',
	'yes',
	'Enter inspector needs neighbouring site access details',
	textInputCharacterLimits.defaultTextareaLength,
	`Inspector needs neighbouring site access details must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
