import { createCheckboxTextItemsValidator } from '#lib/validators/checkbox-text-items.validator.js';
import { LENGTH_1000, LENGTH_250 } from '@pins/appeals/constants/support.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateInvalidReason = createValidator(
	body('invalidReason')
		.exists()
		.withMessage('Select why the appeal is invalid')
		.bail()
		.notEmpty()
		.withMessage('Select why the appeal is invalid')
		.bail()
		.isLength({ max: LENGTH_1000 })
		.withMessage(`Reason must be ${LENGTH_1000} characters or less`)
);

export const validateInvalidReasonTextItems = createCheckboxTextItemsValidator('invalidReason');

export const validateEnforcementNoticeInvalid = createValidator(
	body('enforcementNoticeInvalid')
		.trim()
		.notEmpty()
		.withMessage('Select yes if the enforcement notice is invalid')
);

export const validateEnforcementNoticeReasonTextItems = createCheckboxTextItemsValidator(
	'invalidReason',
	LENGTH_250
);

export const validateEnforcementNoticeReason = createValidator(
	body('invalidReason')
		.exists()
		.withMessage('Select why the enforcement notice is invalid')
		.bail()
		.notEmpty()
		.withMessage('Select why the enforcement notice is invalid')
);

export const validateOtherLiveAppeals = createValidator(
	body('otherLiveAppeals')
		.trim()
		.notEmpty()
		.withMessage('Select yes if there are any other live appeals against the enforcement notice')
);
