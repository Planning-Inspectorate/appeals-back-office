import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { LENGTH_1000 } from '@pins/appeals/constants/support.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { capitalize } from 'lodash-es';

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

export const validateOtherReasonInput = createValidator(
	body('rejectionReason-30')
		// Run validation only if "30" is in the rejectionReason array
		.if((value, { req }) => {
			const reason = req.body.rejectionReason;

			// If reason is a string (only one checkbox selected)
			if (typeof reason === 'string') {
				return reason === '30'; // Other reason (30)
			}

			// If reason is an array (multiple checkboxes selected)
			if (Array.isArray(reason)) {
				return reason.includes('30'); // Other reason (30);
			}

			return false;
		})

		// Field validation (only runs if Other reason is selected)
		.trim()
		.notEmpty()
		.withMessage(capitalize('The reason field cannot be empty'))
		.bail()
		.isLength({ max: LENGTH_1000 })
		.withMessage(`Reason must be ${LENGTH_1000} characters or less`)
		.withMessage(capitalize('The reason field contains invalid characters'))
);
