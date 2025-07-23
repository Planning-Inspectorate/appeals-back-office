import stringTokenReplacement from '@pins/appeals/utils/string-token-replacement.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

const EMAIL_MAX_LENGTH = 254;
const INVALID_EMAIL_MESSAGE = 'Enter an email address in the correct format, like name@example.com';

export const createEmailInputValidator = (
	fieldName = 'email',
	emptyErrorMessage = 'Enter an email address',
	maxLength = EMAIL_MAX_LENGTH,
	maxLengthErrorMessage = `Email must be ${maxLength} characters or less`
) =>
	createValidator(
		body(fieldName)
			.trim()
			.notEmpty()
			.withMessage((value, { req }) => {
				if (req.params && req.params.userType) {
					return stringTokenReplacement(emptyErrorMessage, [req.params.userType]);
				} else {
					return emptyErrorMessage;
				}
			})
			.bail()
			.isEmail()
			.withMessage(INVALID_EMAIL_MESSAGE)
			.bail()
			.isLength({ max: maxLength })
			.withMessage(maxLengthErrorMessage)
	);

export const createEmailInputOptionalValidator = (
	fieldName = 'email',
	maxLength = EMAIL_MAX_LENGTH,
	maxLengthErrorMessage = `Email must be ${maxLength} characters or less`
) =>
	createValidator(
		body(fieldName)
			.optional({ nullable: true, checkFalsy: true })
			.bail()
			.isEmail()
			.withMessage(INVALID_EMAIL_MESSAGE)
			.bail()
			.isLength({ max: maxLength })
			.withMessage(maxLengthErrorMessage)
	);
