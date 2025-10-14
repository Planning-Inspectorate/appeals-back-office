import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './highway-land.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHighwayLand))
	.post(asyncHandler(controllers.postChangeHighwayLand));

export default router;
