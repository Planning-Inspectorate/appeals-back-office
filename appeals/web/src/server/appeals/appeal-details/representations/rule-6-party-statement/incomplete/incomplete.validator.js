import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateSetNewDate = createYesNoRadioValidator(
	'setNewDate',
	'Select yes if you want to allow the rule 6 party to resubmit their statement'
);
