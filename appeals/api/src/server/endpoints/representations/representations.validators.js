import validateIdParameter from '#common/validators/id-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import { APPEAL_REPRESENTATION_STATUS } from '@pins/appeals/constants/common.js';
import {
	ERROR_INVALID_EMAIL,
	ERROR_MUST_BE_ARRAY_OF_STRINGS,
	ERROR_MUST_BE_STRING,
	ERROR_REP_OUTCOME_MUST_BE_ONE_OF
} from '@pins/appeals/constants/support.js';
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
			APPEAL_REPRESENTATION_STATUS.VALID,
			APPEAL_REPRESENTATION_STATUS.INCOMPLETE
		])
		.withMessage(ERROR_REP_OUTCOME_MUST_BE_ONE_OF),
	validationErrorHandler
);

export const createRepresentationValidator = composeMiddleware(
	validateIdParameter('appealId'),
	body('ipDetails.firstName').isString().withMessage(ERROR_MUST_BE_STRING),
	body('ipDetails.lastName').isString().withMessage(ERROR_MUST_BE_STRING),
	body('ipDetails.email').optional({ checkFalsy: true }).isEmail().withMessage(ERROR_INVALID_EMAIL),
	body('attachments')
		.optional()
		.isArray()
		.custom((value) => value.every((/** @type {*} */ item) => typeof item === 'string'))
		.withMessage(ERROR_MUST_BE_ARRAY_OF_STRINGS),
	body('redactionStatus').isString(),
	validationErrorHandler
);

export const validateRejectionReasonsPayload = composeMiddleware(
	body('rejectionReasons')
		.isArray({ min: 0 })
		.withMessage('rejectionReasons must be a non-empty array'),
	body('rejectionReasons.*.id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
	body('rejectionReasons.*.text')
		.isArray()
		.withMessage('text must be an array of strings')
		.custom((value) =>
			value.every((/** @type {*} */ item) => typeof item === 'string' || value.length === 0)
		)
		.withMessage(ERROR_MUST_BE_ARRAY_OF_STRINGS),
	validationErrorHandler
);
