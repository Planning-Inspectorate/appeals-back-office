import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAffectsProtectedSpecies = createYesNoRadioValidator(
	'protectedSpeciesRadio',
	'Select yes if the development would affect a protected species'
);
