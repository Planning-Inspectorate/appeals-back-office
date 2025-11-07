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

/**
 *
 * @param {string} [fieldName='email'] - The name of the field.
 * @param {string} [emptyErrorMessage='Enter an email address'] - Error message if mandatory and empty.
 * @param {number} [maxLength=EMAIL_MAX_LENGTH] - Max length.
 * @param {string} [maxLengthErrorMessage] - Error message for max length.
 */
export const createEmailInputConditionallyMandatoryValidator = (
	fieldName = 'email',
	emptyErrorMessage = 'Enter an email address',
	maxLength = EMAIL_MAX_LENGTH,
	maxLengthErrorMessage = `Email must be ${maxLength} characters or less`
) =>
	createValidator(
		body(fieldName)
			.if((value) => typeof value !== 'undefined')
			.trim()
			.custom((value, { req }) => {
				const isMandatory =
					(req.currentAppeal && typeof req.currentAppeal.agent === 'undefined') ||
					req.params?.userType === 'agent';

				if (isMandatory && !value) {
					if (req.params && req.params.userType) {
						throw new Error(stringTokenReplacement(emptyErrorMessage, [req.params.userType]));
					}
				}

				return true;
			})
			.bail()
			.if(body(fieldName).notEmpty())
			.isEmail()
			.bail()
			.withMessage(INVALID_EMAIL_MESSAGE)
			.isLength({ max: maxLength })
			.bail()
			.withMessage(maxLengthErrorMessage)
	);
