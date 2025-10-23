import { removeCommasFromNumericInput } from '#lib/sanitizers/numeric-input-sanitizer.js';
import { NUMERIC_INPUT_REGEX } from '@pins/appeals/constants/support.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize } from 'lodash-es';

/**
 * @typedef {import('express-validator').ValidationChain} ValidationChain
 * @typedef {import('express-validator').CustomValidator} CustomValidator
 */

const MIN_NET_RESIDENCE_GAIN_OR_LOSS = 1;
const MAX_NET_RESIDENCE_GAIN_OR_LOSS = 999999;

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
			.matches(NUMERIC_INPUT_REGEX)
			.withMessage(`${capitalize(fieldName)} must be a number, like 5`)
			.custom((value) => {
				// Remove commas
				const sanitizedValue = removeCommasFromNumericInput(value);

				if (sanitizedValue < MIN_NET_RESIDENCE_GAIN_OR_LOSS) {
					throw new Error(`${capitalize(fieldName)} must be a whole number, like 5`);
				}

				if (sanitizedValue > MAX_NET_RESIDENCE_GAIN_OR_LOSS) {
					throw new Error(`${capitalize(fieldName)} must be 6 digits or less`);
				}

				return true;
			})
	);
};
