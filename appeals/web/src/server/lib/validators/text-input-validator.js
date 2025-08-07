import { createValidator } from '@pins/express';
import { body } from 'express-validator';

import stringTokenReplacement from '@pins/appeals/utils/string-token-replacement.js';
import { capitalize } from 'lodash-es';
import { camelCaseToWords } from '#lib/string-utilities.js';

const TEXT_INPUT_MAX_CHARACTERS = 300;

export const createTextInputValidator = (
	fieldName = 'text',
	emptyErrorMessage = 'Enter text',
	maxCharactersAllowed = TEXT_INPUT_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXT_INPUT_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.trim()
			.isLength({ min: 1 })
			.withMessage((value, { req }) => {
				if (req.params && req.params.userType) {
					return stringTokenReplacement(emptyErrorMessage, [req.params.userType]);
				} else {
					return emptyErrorMessage;
				}
			})
			.bail()
			.matches(/^[A-Za-z0-9 .,'!&-]+$/)
			.withMessage(() => {
				return `${capitalize(
					`${camelCaseToWords(fieldName)}`
				)} must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes`;
			})
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);

export const createTextInputOptionalValidator = (
	fieldName = 'text',
	maxCharactersAllowed = TEXT_INPUT_MAX_CHARACTERS,
	maxCharactersErrorMessage = `Text must be ${TEXT_INPUT_MAX_CHARACTERS} characters or less`
) =>
	createValidator(
		body(fieldName)
			.trim()
			.bail()
			.optional({ nullable: true, checkFalsy: true })
			.matches(/^[A-Za-z0-9 .,'!&-]+$/)
			.withMessage(
				'Organisation name must only include letters a to z, numbers 0 to 9, and special characters such as hyphens, spaces and apostrophes'
			)
			.isLength({ max: maxCharactersAllowed })
			.withMessage(maxCharactersErrorMessage)
	);
