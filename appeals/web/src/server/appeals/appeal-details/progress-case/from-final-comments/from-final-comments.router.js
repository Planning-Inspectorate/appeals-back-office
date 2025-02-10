import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';

import * as controller from './from-final-comments.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.renderProgressFromFinalComments))
	.post(asyncHandler(controller.postProgressFromFinalComments));

export default router;
