import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAffectsProtectedSpecies = createYesNoRadioValidator(
	'protectedSpeciesRadio',
	'Select yes if a protected species is affected'
);
