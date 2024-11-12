import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './eia-development-description.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeEiaDevelopmentDescription))
	.post(asyncHandler(controllers.postChangeEiaDevelopmentDescription));

export default router;
