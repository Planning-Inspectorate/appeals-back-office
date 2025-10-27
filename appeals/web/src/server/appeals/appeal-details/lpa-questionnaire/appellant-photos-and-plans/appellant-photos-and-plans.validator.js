import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';

export const validateAppellantPhotosAndPlans = createYesNoRadioValidator(
	'appellantPhotosAndPlansRadio',
	'Select yes if the appellant submitted complete and accurate photographs and plans'
);
