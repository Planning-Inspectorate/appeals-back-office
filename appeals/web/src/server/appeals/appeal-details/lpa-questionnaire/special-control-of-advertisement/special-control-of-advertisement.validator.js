import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateSpecialControlOfAdvertisement = createYesNoRadioValidator(
	'specialControlOfAdvertisementRadio',
	'Select yes if the site is in an area of special control for advertisements'
);
