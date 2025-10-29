import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateHighwayTrafficPublicSafety = createYesNoRadioValidator(
	'highwayTrafficPublicSafetyRadio',
	'Select yes if the application was refused because of highway or traffic public safety'
);
