import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateIsAppealInvalid = createYesNoRadioValidator(
	'lpaConsiderAppealInvalid',
	'Select yes if you consider the appeal invalid?'
);
