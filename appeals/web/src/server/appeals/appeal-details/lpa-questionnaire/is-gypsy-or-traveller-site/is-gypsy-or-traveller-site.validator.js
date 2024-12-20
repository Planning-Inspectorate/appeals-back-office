import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateGypsyOrTravellerSite = createYesNoRadioValidator(
	'isGypsyOrTravellerSiteRadio',
	'Select whether the Gypsy or Traveller communities are affected'
);
