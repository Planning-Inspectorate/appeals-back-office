import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateCorrectAppealType = createYesNoRadioValidator(
	'correctAppealTypeRadio',
	'Select yes if this is the correct type of appeal'
);
