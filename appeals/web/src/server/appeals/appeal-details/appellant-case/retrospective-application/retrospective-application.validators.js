import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateRetrospectiveApplication = createYesNoRadioValidator(
	'retrospectiveApplication',
	'Select yes if anyone submitted a retrospective planning application'
);
