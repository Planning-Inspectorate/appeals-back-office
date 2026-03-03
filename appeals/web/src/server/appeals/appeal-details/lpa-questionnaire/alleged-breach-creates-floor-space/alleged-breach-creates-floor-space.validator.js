import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const validateAllegedBreachCreatesFloorSpace = createYesNoRadioValidator(
	'floorSpaceCreatedByBreachInSquareMetresRadio',
	'Select yes if the alleged breach creates any floor space'
);

const validateFloorSpaceAmount = createValidator(
	body('floorSpaceCreatedByBreachInSquareMetres')
		.if(body('floorSpaceCreatedByBreachInSquareMetresRadio').equals('yes'))
		.trim()
		.isNumeric()
		.withMessage('Floor space must be a number or decimal')
);

export const validateAllegedBreachCreatesFloorSpaceFields = [
	validateAllegedBreachCreatesFloorSpace,
	validateFloorSpaceAmount
];
