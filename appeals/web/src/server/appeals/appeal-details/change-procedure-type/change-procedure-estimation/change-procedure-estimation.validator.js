import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize } from 'lodash-es';

export const validateYesNoInput = createYesNoRadioValidator(
	'estimationYesNo',
	'Select yes if you know the expected number of days to carry out the inquiry'
);

export const validateEstimationInput = createValidator(
	body('estimationDays')
		.if(body('estimationYesNo').equals('yes'))
		.trim()
		.notEmpty()
		.withMessage(capitalize('Enter the expected number of days to carry out the inquiry'))
		.bail()
		.isNumeric()
		.withMessage(capitalize('Enter the number of days using numbers 0 to 99'))
		.bail()
		.isFloat({ min: 0, max: 99 })
		.withMessage(capitalize('Enter the number of days using numbers 0 to 99'))
		.bail()
		.custom((value) => {
			const floatValue = parseFloat(value);
			return floatValue % 0.5 === 0;
		})
		.withMessage(capitalize('Number of days must be a whole or half number, like 3 or 3.5'))
);
