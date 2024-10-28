import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import { validateComment } from '../interested-party-comments.middleware.js';
import { renderRedactInterestedPartyComment } from './redact.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, validateComment, asyncHandler(renderRedactInterestedPartyComment));

// router
// 	.route('/:commentId/redact')
// 	.get(validateAppeal, validateComment, asyncHandler(controller.renderReviewInterestedPartyComment))
// 	.post(
// 		validateAppeal,
// 		validateComment,
// 		validateReviewComment,
// 		asyncHandler(controller.postReviewInterestedPartyComment)
// 	);

export default router;
