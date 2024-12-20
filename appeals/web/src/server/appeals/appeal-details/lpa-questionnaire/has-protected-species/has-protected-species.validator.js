import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAffectsProtectedSpecies = createYesNoRadioValidator(
	'protectedSpeciesRadio',
	'Select whether protected species are affected'
);
