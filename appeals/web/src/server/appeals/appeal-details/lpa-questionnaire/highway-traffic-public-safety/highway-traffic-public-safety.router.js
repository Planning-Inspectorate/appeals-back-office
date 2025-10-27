import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './highway-traffic-public-safety.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHighwayTrafficPublicSafety))
	.post(asyncHandler(controllers.postChangeHighwayTrafficPublicSafety));

export default router;
