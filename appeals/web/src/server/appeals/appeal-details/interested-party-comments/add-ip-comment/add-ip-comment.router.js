import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './add-ip-comment.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/ip-details')
	.get(asyncHandler(controller.renderIpDetails))
	.post(asyncHandler(controller.postIpDetails));

router
	.route('/check-address')
	.get(asyncHandler(controller.renderCheckAddress))
	.post(asyncHandler(controller.postCheckAddress));

router
	.route('/ip-address')
	.get(asyncHandler(controller.renderIpAddress))
	.post(asyncHandler(controller.postIpAddress));

router.route('/').get(asyncHandler(controller.redirectTopLevel));

export default router;
