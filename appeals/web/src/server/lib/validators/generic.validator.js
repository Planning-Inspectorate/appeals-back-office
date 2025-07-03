import { createValidator } from '@pins/express';
import { body } from 'express-validator';

/**
 *
 * @param {string} errorMessage
 */
export const createNotEmptyBodyValidator = (errorMessage) => {
	return createValidator(
		body().custom((_, { req }) => {
			if (Object.keys(req.body).length === 0 || Object.values(req.body).every((value) => !value)) {
				throw new Error(errorMessage, { cause: 'all-fields' });
			}
			return true;
		})
	);
};
