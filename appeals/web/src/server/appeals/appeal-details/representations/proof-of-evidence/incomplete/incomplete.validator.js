import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

/**
 * @param {string} [message]
 * @returns {import('express').RequestHandler<any>}
 */
export const validateIncompleteReason = (message) =>
	createValidator(
		body('rejectionReason')
			.exists()
			.withMessage(message || 'Select why you are rejecting the comment')
	);

export const validateIncompleteReasonTextItems =
	createCheckboxTextItemsValidator('IncompleteReason');
