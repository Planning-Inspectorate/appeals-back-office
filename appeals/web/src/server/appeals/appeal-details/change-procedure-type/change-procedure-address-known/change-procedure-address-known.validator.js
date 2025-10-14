import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAddressKnown = createYesNoRadioValidator(
	'addressKnown',
	'Select yes if you know the address of where the inquiry will take place'
);
