import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import { validateComment } from './view-and-review.middleware.js';
import * as controller from './view-and-review.controller.js';
import { validateReviewComment } from './view-and-review.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:commentId/view')
	.get(validateAppeal, validateComment, asyncHandler(controller.renderViewInterestedPartyComment));

router
	.route('/:commentId/review')
	.get(validateAppeal, validateComment, asyncHandler(controller.renderReviewInterestedPartyComment))
	.post(
		validateAppeal,
		validateComment,
		validateReviewComment,
		asyncHandler(controller.renderPostReviewInterestedPartyComment)
	);

export default router;
