import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createValidator } from '@pins/express';

export const validateDateKnown = createValidator(
	createYesNoRadioValidator(
		'dateKnown',
		'Select yes if you know the date and time the hearing will take place'
	)
);
