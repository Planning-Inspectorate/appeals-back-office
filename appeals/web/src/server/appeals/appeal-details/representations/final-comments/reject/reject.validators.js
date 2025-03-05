import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
import { formatFinalCommentsTypeText } from '../view-and-review/view-and-review.mapper.js';

/**
 * @param {string} finalCommentsType
 */
export const validateRejectReason = (finalCommentsType) =>
	createValidator(
		body('rejectionReason')
			.exists()
			.withMessage(
				`Select why you are rejecting the ${formatFinalCommentsTypeText(
					finalCommentsType
				)}'s final comment`
			)
	);

export const validateRejectionReasonTextItems = createCheckboxTextItemsValidator('rejectionReason');
