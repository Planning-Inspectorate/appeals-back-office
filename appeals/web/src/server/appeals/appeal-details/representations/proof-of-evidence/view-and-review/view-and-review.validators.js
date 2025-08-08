import { APPEAL_PROOF_OF_EVIDENCE_STATUS } from '@pins/appeals/constants/common.js';
import { createValidator } from '@pins/express';
import { body } from 'express-validator';

export const validateReviewProofOfEvidence = createValidator(
	body('status')
		.notEmpty()
		.withMessage('Review decision must be provided')
		.bail()
		.isIn([APPEAL_PROOF_OF_EVIDENCE_STATUS.VALID, APPEAL_PROOF_OF_EVIDENCE_STATUS.INVALID])
		.withMessage('Review decision must be provided')
);
