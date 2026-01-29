import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateRelatesToAgriculturalPurpose = createYesNoRadioValidator(
	'relatesToAgriculturalPurposeRadio',
	'Select yes if the building is on agricultural land and will be used for agricultural purposes'
);
