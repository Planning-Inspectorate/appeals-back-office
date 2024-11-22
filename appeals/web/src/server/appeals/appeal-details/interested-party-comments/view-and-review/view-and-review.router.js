import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './view-and-review.controller.js';
import { validateReviewComment } from './view-and-review.validators.js';
import rejectRouter from './reject/reject.router.js';
import {
	redirectIfCommentIsReviewed,
	redirectIfCommentIsUnreviewed
} from './view-and-review.middleware.js';

const router = createRouter({ mergeParams: true });

router.use('/reject', rejectRouter);

router
	.route('/view')
	.get(redirectIfCommentIsUnreviewed, asyncHandler(controller.renderViewInterestedPartyComment));

router
	.route('/review')
	.get(redirectIfCommentIsReviewed, asyncHandler(controller.renderReviewInterestedPartyComment))
	.post(validateReviewComment, asyncHandler(controller.postReviewInterestedPartyComment));

export default router;
