import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateSingleDwellingHouse = createYesNoRadioValidator(
	'singleDwellingHouseRadio',
	'Select yes if the enforcement notice for a single private dwelling house'
);
