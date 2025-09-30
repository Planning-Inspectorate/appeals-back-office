import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './site-ownership.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeSiteOwnership))
	.post(asyncHandler(controllers.postChangeSiteOwnership));

export default router;
