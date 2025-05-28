import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateGypsyOrTravellerSite = createYesNoRadioValidator(
	'isGypsyOrTravellerSiteRadio',
	'Select yes if the development relates to anyone claiming to be a Gypsy or Traveller'
);
