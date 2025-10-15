import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validatePreserveGrantLoan = createYesNoRadioValidator(
	'specialControlOfAdvertisementRadio',
	'Select yes if you know whether the site is in an area of special control for advertisements'
);
