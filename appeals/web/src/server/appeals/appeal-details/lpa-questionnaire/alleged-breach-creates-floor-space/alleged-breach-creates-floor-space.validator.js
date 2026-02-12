import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAllegedBreachCreatesFloorSpace = createYesNoRadioValidator(
	'floorSpaceCreatedByBreachInSquareMetresRadio',
	'Select yes if the alleged breach creates any floor space'
);
