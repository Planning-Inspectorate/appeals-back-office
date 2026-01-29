import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateChangeOfUseMineralExtraction = createYesNoRadioValidator(
	'changeOfUseMineralExtractionRadio',
	'Select yes if the enforcement notice includes a change of use of land to store minerals in the open?'
);
