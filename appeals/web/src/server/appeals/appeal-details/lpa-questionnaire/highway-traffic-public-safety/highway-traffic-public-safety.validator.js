import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validatePreserveGrantLoan = createYesNoRadioValidator(
	'highwayTrafficPublicSafetyRadio',
	'Select yes if you know whether the application was refused because of highway or traffic public safety'
);
