import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const vaidateGreenbeltRadio = createYesNoRadioValidator(
	'greenBeltRadio',
	'Select yes if the site is in a green belt'
);
