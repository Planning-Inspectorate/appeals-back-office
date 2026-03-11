import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './enforcement-notice-withdrawal.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getDocumentUpload))
	.post(asyncHandler(controller.postDocumentUpload));

export default router;
