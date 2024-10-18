import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../appeal-details.middleware.js';
import addIpCommentRouter from './add-ip-comment/add-ip-comment.router.js';
import viewAndReviewIpCommentRouter from './view-and-review/view-and-review.router.js';
import * as controller from './interested-party-comments.controller.js';

const router = createRouter({ mergeParams: true });

router.use('/', viewAndReviewIpCommentRouter);
router.route('/').get(validateAppeal, asyncHandler(controller.renderInterestedPartyComments));
router.use('/add', validateAppeal, addIpCommentRouter);

export default router;
