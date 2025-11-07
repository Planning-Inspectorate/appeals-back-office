import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import { createEmailInputConditionallyMandatoryValidator } from '#lib/validators/email-input.validator.js';
import {
	createTextInputOptionalValidator,
	createTextInputValidator
} from '#lib/validators/text-input-validator.js';
import stringTokenReplacement from '@pins/appeals/utils/string-token-replacement.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateChangeServiceUser = createValidator(
	createTextInputValidator(
		'firstName',
		`Enter the {replacement0}'s first name`,
		textInputCharacterLimits.defaultInputLength,
		`First name must be ${textInputCharacterLimits.defaultInputLength} characters or less`
	),
	createTextInputValidator(
		'lastName',
		`Enter the {replacement0}'s last name`,
		textInputCharacterLimits.defaultInputLength,
		`Last name must be ${textInputCharacterLimits.defaultInputLength} characters or less`
	),
	createTextInputOptionalValidator(
		'organisationName',
		textInputCharacterLimits.defaultInputLength,
		`Organisation name must be ${textInputCharacterLimits.defaultInputLength} characters or less`
	),
	createEmailInputConditionallyMandatoryValidator(
		'emailAddress',
		`Enter the {replacement0}'s email address`
	),
	body('phoneNumber')
		.if((value) => typeof value !== 'undefined')
		.trim()
		.isLength({ min: 1 })
		.withMessage((value, { req }) => {
			const isMandatory =
				(req.currentAppeal && typeof req.currentAppeal.agent === 'undefined') ||
				req.params?.userType === 'agent';

			if (isMandatory && !value) {
				if (req.params && req.params.userType) {
					return stringTokenReplacement(`Enter the {replacement0}'s phone number`, [
						req.params.userType
					]);
				} else {
					return `Enter the phone number`;
				}
			}

			return true;
		})
		.bail()
		.customSanitizer((value) => {
			const sanitizedPhoneNumber = value.replace(/[\s-()]/g, '');
			if (sanitizedPhoneNumber.startsWith('+44')) {
				return `0${sanitizedPhoneNumber.substring(3)}`;
			}
			return sanitizedPhoneNumber;
		})
		.matches(/^0\d{10}$/)
		.withMessage(
			'Enter a valid UK phone number, like 01632 960 001, 07700 900 982 or +44 808 157 0192'
		)
);
