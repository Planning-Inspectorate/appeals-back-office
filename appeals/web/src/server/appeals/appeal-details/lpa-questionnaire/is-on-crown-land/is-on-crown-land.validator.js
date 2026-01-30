import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateIsOnCrownLand = createYesNoRadioValidator(
	'isOnCrownLandRadio',
	'Select yes if the appeal site is on Crown land?'
);
