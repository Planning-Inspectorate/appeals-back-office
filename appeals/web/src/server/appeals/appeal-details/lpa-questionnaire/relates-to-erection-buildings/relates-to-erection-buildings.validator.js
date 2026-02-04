import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateRelatesToErectionBuildings = createYesNoRadioValidator(
	'relatesToErectionBuildingsRadio',
	'Select yes if the enforcement notice includes the erection of a building or buildings'
);
