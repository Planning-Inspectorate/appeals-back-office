import {
	createEmailInputOptionalValidator,
	createEmailInputValidator
} from '#lib/validators/email-input.validator.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import {
	createTextInputValidatorMinMax,
	TEXT_INPUT_MAX_CHARACTERS,
	TEXT_INPUT_MIN_CHARACTERS
} from '#lib/validators/text-input-validator.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateRule6PartyId = async (req, res, next) => {
	const { rule6PartyId } = req.params;
	if (!areIdParamsValid(rule6PartyId)) {
		return res.status(400).render('app/400.njk');
	}

	next();
};

export const validateName = createTextInputValidatorMinMax(
	'organisationName',
	'Enter a Rule 6 party name',
	TEXT_INPUT_MAX_CHARACTERS,
	TEXT_INPUT_MIN_CHARACTERS,
	/^[A-Za-z .,'!&-]+$/,
	`The name must be between ${TEXT_INPUT_MIN_CHARACTERS} and ${TEXT_INPUT_MAX_CHARACTERS} characters`,
	`The name must not include numbers`
);

/**
 * @type {import("express").RequestHandler}
 */
export const validateEmail = (req, res, next) => {
	const isGeneric = isGenericAppealType(req.currentAppeal?.appealType);
	if (isGeneric) {
		return createEmailInputOptionalValidator('email')(req, res, next);
	}
	return createEmailInputValidator('email', 'Enter a Rule 6 party email address')(req, res, next);
};
