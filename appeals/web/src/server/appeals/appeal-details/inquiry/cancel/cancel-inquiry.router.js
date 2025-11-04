import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './cancel-inquiry.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getCancelInquiry))
	.post(asyncHandler(controller.postCancelInquiry));

export default router;
