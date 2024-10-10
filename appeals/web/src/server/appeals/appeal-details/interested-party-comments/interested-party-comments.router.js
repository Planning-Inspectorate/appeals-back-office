import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '../appeal-details.middleware.js';
import { validateComment } from './interested-party-comments.middleware.js';
import addIpCommentRouter from './add-ip-comment/add-ip-comment.router.js';
import * as validators from './interested-party-comments.validators.js';
import * as controller from './interested-party-comments.controller.js';

const router = createRouter({ mergeParams: true });

router.use('/add', validateAppeal, addIpCommentRouter);

router.route('/').get(validateAppeal, asyncHandler(controller.renderInterestedPartyComments));

router
	.route('/:commentId/view')
	.get(validateAppeal, validateComment, asyncHandler(controller.renderViewInterestedPartyComment));

router
	.route('/:commentId/review')
	.get(validateAppeal, validateComment, asyncHandler(controller.renderReviewInterestedPartyComment))
	.post(
		validateAppeal,
		validateComment,
		validators.validateReviewComment,
		asyncHandler(controller.renderPostReviewInterestedPartyComment)
	);

export default router;
