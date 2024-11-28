import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAffectsScheduledMonument = createYesNoRadioValidator(
	'affectsScheduledMonumentRadio',
	'Select yes if a scheduled monument is affected'
);
