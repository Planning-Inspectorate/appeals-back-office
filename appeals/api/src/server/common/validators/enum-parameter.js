import { body, param } from 'express-validator';

/** @typedef {import('express-validator').ValidationChain} ValidationChain */

/**
 * @param {string} parameterName
 * @param {string[]} validValues
 * @param {boolean} allowNull
 * @returns {ValidationChain}
 */
const validateEnumParameter = (parameterName, validValues, allowNull = false) =>
	body(parameterName)
		.optional()
		.custom((value) => {
			if (value === null && allowNull) {
				return true;
			}
			if (validValues.includes(value)) {
				return true;
			}
			return false;
		})
		.withMessage(
			`Must be${allowNull ? ' null or' : ''} one of the following values: ${validValues.join(', ')}`
		);

/**
 * @param {string} parameterName
 * @param {string[]} validValues
 * @param {boolean} allowNull
 * @returns {ValidationChain}
 */
export const validateEnumParameterPath = (parameterName, validValues, allowNull = false) =>
	param(parameterName)
		.optional()
		.custom((value) => {
			if (value === null && allowNull) {
				return true;
			}
			if (validValues.includes(value)) {
				return true;
			}
			return false;
		})
		.withMessage(
			`Must be${allowNull ? ' null or' : ''} one of the following values: ${validValues.join(', ')}`
		);

export default validateEnumParameter;
