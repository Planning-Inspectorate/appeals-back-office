import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './highway-traffic-public-safety.controller.js';
import { validateHighwayTrafficPublicSafety } from './highway-traffic-public-safety.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHighwayTrafficPublicSafety))
	.post(
		validateHighwayTrafficPublicSafety,
		asyncHandler(controllers.postChangeHighwayTrafficPublicSafety)
	);

export default router;
