import { createValidator } from '@pins/express';
import { body } from 'express-validator';

/**
 * @param {string} fieldName
 * @param {string} label
 * @param {number} max
 */
export const createGridRefFieldValidator = (fieldName, label, max) =>
	body(fieldName)
		.trim()
		.notEmpty()
		.withMessage(`Enter the ${label.toLowerCase()} grid reference`)
		.matches(/^[0-9]+$/)
		.withMessage(`${label} must only include numbers 0 to 9`)
		.custom((value) => {
			if (Number(value) > max) {
				throw new Error(`${label} must be ${max} or less`);
			}
			return true;
		})
		.isLength({ min: 6 })
		.withMessage(`${label} must be at least 6 digits`);

export const validateGridReference = createValidator(
	createGridRefFieldValidator('siteGridReferenceEasting', 'Eastings', 692200),
	createGridRefFieldValidator('siteGridReferenceNorthing', 'Northings', 1299999)
);
