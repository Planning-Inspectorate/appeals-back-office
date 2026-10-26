import { validateEmailParameter } from '#common/validators/email-parameter.js';
import validateIdParameter from '#common/validators/id-parameter.js';
import { validateRequiredStringParameter } from '#common/validators/string-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { isGenericAppealType } from '@pins/appeals/utils/appeal-type-checks.js';
import { composeMiddleware } from '@pins/express';

export const getRule6PartiesValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validationErrorHandler
);

export const validateRule6PartyParams = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('rule6PartyId'),
	validationErrorHandler
);

/**
 * @type {import('express').RequestHandler}
 */
export const validateRule6PartyEmail = (req, res, next) => {
	const isGeneric = isGenericAppealType(req.appeal?.appealType?.type);
	return validateEmailParameter('serviceUser.email', isGeneric)(req, res, next);
};

export const addRule6PartyValidator = composeMiddleware(
	validateRequiredStringParameter('serviceUser.organisationName'),
	validateRule6PartyEmail,
	validationErrorHandler
);

export const updateRule6PartyValidator = composeMiddleware(
	validateRequiredStringParameter('serviceUser.organisationName'),
	validateRule6PartyEmail,
	validationErrorHandler
);

export const deleteRule6PartyValidator = validateRule6PartyParams;
