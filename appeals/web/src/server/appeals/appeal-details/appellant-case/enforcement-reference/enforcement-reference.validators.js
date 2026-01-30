import stringTokenReplacement from '@pins/appeals/utils/string-token-replacement.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateEnforcementReference = createValidator(
	body('enforcementReference')
		.trim()
		.isLength({ min: 1 })
		.withMessage((value, { req }) => {
			if (req.params && req.params.userType) {
				return stringTokenReplacement('Enter the reference number on the enforcement notice', [
					req.params.userType
				]);
			} else {
				return 'Enter the reference number on the enforcement notice';
			}
		})
		.bail()
		.isLength({ max: 250 })
		.withMessage('Reference number must be 250 characters or less')
);
