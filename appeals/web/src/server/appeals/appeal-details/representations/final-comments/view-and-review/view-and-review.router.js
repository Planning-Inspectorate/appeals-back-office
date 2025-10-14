import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './view-and-review.controller.js';
import { validateReviewComments } from './view-and-review.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.renderReviewFinalComments))
	.post(validateReviewComments, asyncHandler(controller.postReviewFinalComments));

export default router;
