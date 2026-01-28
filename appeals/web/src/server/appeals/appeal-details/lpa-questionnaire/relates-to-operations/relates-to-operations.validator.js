import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateRelatesToOperations = createYesNoRadioValidator(
	'relatesToOperationsRadio',
	'Select yes if the enforcement notice relates to building, engineering, mining or other operations'
);
