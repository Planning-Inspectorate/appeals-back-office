import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateHasAllegedBreachArea = createYesNoRadioValidator(
	'hasAllegedBreachAreaRadio',
	'Select yes if the area of the alleged breach the same as the site area'
);
