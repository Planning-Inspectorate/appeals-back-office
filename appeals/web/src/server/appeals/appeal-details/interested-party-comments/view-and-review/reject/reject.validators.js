import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateRejectReason = createValidator(
	body('rejectionReason').exists().withMessage('Select why you are rejecting the comment')
);

export const validateRejectionReasonTextItems = createCheckboxTextItemsValidator('rejectionReason');

export const validateAllowResubmit = createYesNoRadioValidator(
	'allowResubmit',
	'Select yes if you want to allow the interested party to resubmit a comment'
);
