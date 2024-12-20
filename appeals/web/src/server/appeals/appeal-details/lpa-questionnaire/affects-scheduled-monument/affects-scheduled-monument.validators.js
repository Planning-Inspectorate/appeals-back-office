import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAffectsScheduledMonument = createYesNoRadioValidator(
	'affectsScheduledMonumentRadio',
	'Select whether a scheduled monument is affected'
);
