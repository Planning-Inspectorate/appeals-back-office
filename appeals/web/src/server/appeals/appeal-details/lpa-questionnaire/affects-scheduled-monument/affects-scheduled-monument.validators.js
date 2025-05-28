import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAffectsScheduledMonument = createYesNoRadioValidator(
	'affectsScheduledMonumentRadio',
	'Select affected if the development would affect a scheduled monument'
);
