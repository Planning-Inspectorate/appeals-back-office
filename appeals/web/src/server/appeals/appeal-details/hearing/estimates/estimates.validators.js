import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize, lowerCase } from 'lodash-es';

/**
 * Validates a field that allows days or half days
 * @param {string} name - The name of the field
 * @param {string} label - The label used in error messages
 * @returns {import('express').RequestHandler<any>} The validation middleware
 */
const daysOrHalfDaysValidator = (name, label) =>
	createValidator(
		body(name)
			.trim()
			.notEmpty()
			.withMessage(`Enter ${lowerCase(label)}`)
			.bail()
			.isNumeric()
			.withMessage(`${capitalize(label)} must be a number`)
			.bail()
			.isFloat({ min: 0, max: 99 })
			.withMessage(`${capitalize(label)} must be between 0 and 99`)
			.bail()
			.custom((value) => {
				const floatValue = parseFloat(value);
				return floatValue % 0.5 === 0;
			})
			.withMessage(`${capitalize(label)} must be in increments of 0.5`)
	);

export const validatePreparationTime = daysOrHalfDaysValidator(
	'preparationTime',
	'Estimated preparation time'
);
export const validateSittingTime = daysOrHalfDaysValidator('sittingTime', 'Estimated sitting time');
export const validateReportingTime = daysOrHalfDaysValidator(
	'reportingTime',
	'Estimated reporting time'
);
