import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize } from 'lodash-es';

/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 * @typedef {import('express-validator').CustomValidator} CustomValidator
 */

export const validateNetResidenceSelected = createValidator(
	body('net-residence')
		.trim()
		.notEmpty()
		.withMessage('Select if there is a net gain or loss of residential units')
);

/**
 * @param {string} fieldName
 * @param {string} fieldId
 * @param {ValidationChain | CustomValidator} [continueValidationCondition]
 * @returns {import('express').RequestHandler<any>}
 */

export const validateNetGainOrLoss = (
	fieldName,
	fieldId,
	// @ts-ignore
	// eslint-disable-next-line no-unused-vars
	continueValidationCondition = (value) => true
) => {
	return createValidator(
		body(fieldId)
			.if(continueValidationCondition)
			.trim()
			.notEmpty()
			.withMessage(`Enter the ${fieldName}`)
			.isNumeric()
			.withMessage(`${capitalize(fieldName)} must be a number, like 5`)
			.isInt({ min: 1 })
			.withMessage(`${capitalize(fieldName)} must be a whole number, like 5`)
	);
};
