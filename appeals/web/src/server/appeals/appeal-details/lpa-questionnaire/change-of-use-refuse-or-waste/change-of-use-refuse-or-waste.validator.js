import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateChangeOfUseRefuseOrWaste = createYesNoRadioValidator(
	'changeOfUseRefuseOrWasteRadio',
	'Select yes if the enforcement notice includes a change of use of land to dispose refuse or waste materials?'
);
