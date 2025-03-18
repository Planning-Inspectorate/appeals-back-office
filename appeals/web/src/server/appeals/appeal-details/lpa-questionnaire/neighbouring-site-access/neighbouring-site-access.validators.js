import { createTextareaConditionalValidator } from '#lib/validators/textarea-validator.js';
import { textInputCharacterLimits } from '#appeals/appeal.constants.js';

export const validateNeighbouringSiteAccessTextArea = createTextareaConditionalValidator(
	'neighbouringSiteAccess',
	'neighbouringSiteAccessRadio',
	'yes',
	'Enter might the inspector need to enter a neighbour’s land or property',
	1,
	`Might the inspector need to enter a neighbour’s land or property must be ${textInputCharacterLimits.defaultTextareaLength} characters or less`
);
