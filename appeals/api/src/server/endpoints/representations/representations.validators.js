import validateIdParameter from '#common/validators/id-parameter.js';
import { ERROR_REP_OUTCOME_MUST_BE_ONE_OF, ERROR_MUST_BE_STRING } from '#endpoints/constants.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import { composeMiddleware } from '@pins/express';
import { body } from 'express-validator';

export const getRepresentationRouteValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('repId').optional(),
	validationErrorHandler
);

export const getRepresentationUpdateValidator = composeMiddleware(
	validateIdParameter('appealId'),
	validateIdParameter('repId'),
	body('redactedRepresentation').optional().isString().withMessage(ERROR_MUST_BE_STRING),
	body('status').optional().isString().withMessage(ERROR_MUST_BE_STRING),
	body('status')
		.optional()
		.isIn([
			APPEAL_REPRESENTATION_STATUS.AWAITING_REVIEW,
			APPEAL_REPRESENTATION_STATUS.INVALID,
			APPEAL_REPRESENTATION_STATUS.VALID
		])
		.withMessage(ERROR_REP_OUTCOME_MUST_BE_ONE_OF),
	validationErrorHandler
);
