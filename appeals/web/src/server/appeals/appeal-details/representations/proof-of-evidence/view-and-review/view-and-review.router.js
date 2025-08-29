import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './view-and-review.controller.js';
import { validateReviewProofOfEvidence } from './view-and-review.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.renderReviewProofOfEvidence))
	.post(
		validateReviewProofOfEvidence,
		saveBodyToSession('reviewProofOfEvidence'),
		asyncHandler(controller.postReviewProofOfEvidence)
	);

export default router;
