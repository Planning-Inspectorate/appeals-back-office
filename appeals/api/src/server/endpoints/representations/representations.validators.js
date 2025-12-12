import validateIdParameter from '#common/validators/id-parameter.js';
import { validationErrorHandler } from '#middleware/error-handler.js';
import {
	APPEAL_REPRESENTATION_STATUS,
	APPEAL_REPRESENTATION_TYPE
} from '@pins/appeals/constants/common.js';
import {
	ERROR_ATTACHMENTS_EMPTY,
	ERROR_ATTACHMENTS_REQUIRED,
	ERROR_INVALID_EMAIL,
	ERROR_INVALID_PROOF_OF_EVIDENCE_TYPE,
	ERROR_INVALID_REPRESENTATION_TYPE,
	ERROR_MUST_BE_ARRAY_OF_STRINGS,
	ERROR_MUST_BE_STRING,
	ERROR_REP_OUTCOME_MUST_BE_ONE_OF
} from '@pins/appeals/constants/support.js';
import { composeMiddleware } from '@pins/express';
import { body, param } from 'express-validator';

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
	param('representationType')
		.isIn(Object.values(APPEAL_REPRESENTATION_TYPE))
		.withMessage(ERROR_INVALID_REPRESENTATION_TYPE),
	body('ipDetails.firstName').optional().isString().withMessage(ERROR_MUST_BE_STRING),
	body('ipDetails.lastName').optional().isString().withMessage(ERROR_MUST_BE_STRING),
	body('ipDetails.email').optional({ checkFalsy: true }).isEmail().withMessage(ERROR_INVALID_EMAIL),
	body('attachments')
		.optional()
		.isArray()
		.custom((value) => value.every((/** @type {*} */ item) => typeof item === 'string'))
		.withMessage(ERROR_MUST_BE_ARRAY_OF_STRINGS),
	body('redactionStatus').isString(),
	body('representationText').optional().isString().withMessage(ERROR_MUST_BE_STRING),
	validationErrorHandler
);

export const createRepresentationProofOfEvidenceValidator = composeMiddleware(
	param('proofOfEvidenceType').isString().withMessage(ERROR_MUST_BE_STRING),
	param('proofOfEvidenceType')
		.isIn(['appellant', 'lpa'])
		.withMessage(ERROR_INVALID_PROOF_OF_EVIDENCE_TYPE),

	body('attachments')
		.exists({ checkFalsy: true })
		.withMessage(ERROR_ATTACHMENTS_REQUIRED)
		.isArray({ min: 1 })
		.withMessage(ERROR_ATTACHMENTS_EMPTY)
		.custom((value) => value.every((/** @type {*} */ item) => typeof item === 'string'))
		.withMessage(ERROR_MUST_BE_ARRAY_OF_STRINGS),
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
