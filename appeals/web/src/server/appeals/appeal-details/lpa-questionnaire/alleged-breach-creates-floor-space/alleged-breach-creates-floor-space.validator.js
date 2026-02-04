import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAllegedBreachCreatesFloorSpace = createYesNoRadioValidator(
	'allegedBreachCreatesFloorSpaceRadio',
	'Select yes if the alleged breach creates any floor space'
);
