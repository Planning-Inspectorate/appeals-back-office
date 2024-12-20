import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAONB = createYesNoRadioValidator(
	'isAonbNationalLandscapeRadio',
	'Select whether the site is in an area of outstanding natural beauty'
);
