import { createValidator } from '@pins/express';
import { body } from 'express-validator';

/**
 * @param {string} fieldName
 * @param {string} message
 * */
export const createYesNoRadioValidator = (fieldName, message) =>
	createValidator(
		body(fieldName)
			.notEmpty()
			.withMessage(message)
			.bail()
			.isIn(['yes', 'no'])
			.withMessage('Something went wrong')
	);
