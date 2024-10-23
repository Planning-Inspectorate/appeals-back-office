import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './view-and-review.controller.js';
import { validateReviewComment } from './view-and-review.validators.js';

const router = createRouter({ mergeParams: true });

router.route('/view').get(asyncHandler(controller.renderViewInterestedPartyComment));

router
	.route('/review')
	.get(asyncHandler(controller.renderReviewInterestedPartyComment))
	.post(validateReviewComment, asyncHandler(controller.postReviewInterestedPartyComment));

export default router;
