import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '../appeal-details.middleware.js';
import { validateComment } from './interested-party-comments.middleware.js';
import * as controller from './interested-party-comments.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/').get(validateAppeal, asyncHandler(controller.renderInterestedPartyComments));

router
	.route('/:commentId/view')
	.get(validateAppeal, validateComment, asyncHandler(controller.renderViewInterestedPartyComment));

export default router;
