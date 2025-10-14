import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './landowner-permission.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeLandownerPermission))
	.post(asyncHandler(controllers.postChangeLandownerPermission));

export default router;
