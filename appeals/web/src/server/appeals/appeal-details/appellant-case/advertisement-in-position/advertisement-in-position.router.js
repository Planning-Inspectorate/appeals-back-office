import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './advertisement-in-position.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeAdvertisementInPosition))
	.post(asyncHandler(controllers.postChangeAdvertisementInPosition));

export default router;
