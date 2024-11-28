import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateGypsyOrTravellerSite = createYesNoRadioValidator(
	'isGypsyOrTravellerSiteRadio',
	'Select yes if Gypsy or Traveller communities are affected'
);
