import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './cancel-hearing.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getCancelHearing))
	.post(asyncHandler(controller.postCancelHearing));

export default router;
