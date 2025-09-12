import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './highway-land.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeHighwayLand))
	.post(validateAppeal, asyncHandler(controllers.postChangeHighwayLand));

export default router;
