import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const validateHasAllegedBreachArea = createYesNoRadioValidator(
	'areaOfAllegedBreachInSquareMetresRadio',
	'Select yes if the area of the alleged breach the same as the site area'
);

const validateAllegedBreachAreaAmountNumeric = createValidator(
	body('areaOfAllegedBreachInSquareMetres')
		.if(body('areaOfAllegedBreachInSquareMetresRadio').equals('no'))
		.trim()
		.isNumeric()
		.withMessage('Floor space must be a number or decimal')
);

export const validateHasAllegedBreachAreaFields = [
	validateHasAllegedBreachArea,
	validateAllegedBreachAreaAmountNumeric
];
