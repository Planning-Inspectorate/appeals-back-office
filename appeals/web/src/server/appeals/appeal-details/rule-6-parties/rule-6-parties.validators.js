import { createEmailInputValidator } from '#lib/validators/email-input.validator.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import {
	createTextInputValidator,
	TEXT_INPUT_MAX_CHARACTERS
} from '#lib/validators/text-input-validator.js';

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

export const validateName = createTextInputValidator(
	'organisationName',
	'Enter a name',
	TEXT_INPUT_MAX_CHARACTERS,
	`Name must be ${TEXT_INPUT_MAX_CHARACTERS} characters or less`
);

export const validateEmail = createEmailInputValidator();
