import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './redetermine.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getRedetermineConfirmationPage))
	.post(asyncHandler(controller.postRedetermine));

router
	.route('/progress')
	.get(asyncHandler(controller.getProgressConfirmationPage))
	.post(asyncHandler(controller.postProgress));

export default router;
