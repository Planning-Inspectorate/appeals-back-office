import { textInputCharacterLimits } from '#appeals/appeal.constants.js';
import {
	createAddressLine1Validator,
	createAddressLine2Validator,
	createPostcodeValidator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import { areIdParamsValid } from '#lib/validators/id-param.validator.js';
import { createTextInputOptionalValidator } from '#lib/validators/text-input-validator.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';
const maxLength = textInputCharacterLimits.defaultAddressInputLength;

export const validateAddNeighbouringSite = createValidator(
	createAddressLine1Validator(),
	createAddressLine2Validator(),
	createTownValidator(),
	createTextInputOptionalValidator(
		'county',
		maxLength,
		`County must be ${maxLength} characters or less`
	),
	createPostcodeValidator()
);

export const validateNeighbouringSiteDeleteAnswer = createValidator(
	body('remove-neighbouring-site')
		.trim()
		.notEmpty()
		.withMessage('Select yes if you want to remove this site')
);

/**
 * @type {import("express").RequestHandler}
 * @returns {Promise<void>}
 */
export const validateAppealId = async (req, res, next) => {
	const { appealId } = req.params;

	if (!areIdParamsValid(appealId)) {
		return res.status(400).render('app/400.njk');
	}
	next();
};
