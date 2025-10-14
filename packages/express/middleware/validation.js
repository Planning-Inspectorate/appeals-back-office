import { validationResult } from 'express-validator';
import { composeMiddleware } from '../utils/compose.js';

/** @typedef {import('express-validator').ValidationError} ValidationError */
/** @typedef {import('express-validator').FieldValidationError} FieldValidationError */

/**
 * Checks if a ValidationError is a FieldValidationError.
 * @param {ValidationError} error .
 * @returns {error is FieldValidationError}
 */
const isFieldValidationError = (error) => {
	return /** @type {FieldValidationError} */ (error).path !== undefined;
};

/** @type {import('../types/express').RenderHandler<any>} */
const expressValidatorErrorHandler = (request, _, next) => {
	const errors = validationResult(request);

	if (!errors.isEmpty()) {
		/** @type {Record<string, ValidationError>} */
		const mappedErrors = errors.mapped();

		/** @type {Record<string, FieldValidationError>} */
		const fieldErrors = {};

		// Filter for FieldValidationErrors only
		for (const key in mappedErrors) {
			const error = mappedErrors[key];
			if (isFieldValidationError(error)) {
				fieldErrors[key] = error;
			}
		}

		request.errors = fieldErrors;
	}
	next();
};

/**
 * Combine multiple express middleware functions into one, and append with the
 * validation handling middleware.
 *
 * @param {...import('../utils/compose').AnyRequestHandler} middleware
 * @returns {import('express').RequestHandler<any>}
 */
export const createValidator = (...middleware) => {
	return /** @type {import('express').RequestHandler} */ (
		composeMiddleware(...middleware, expressValidatorErrorHandler)
	);
};
