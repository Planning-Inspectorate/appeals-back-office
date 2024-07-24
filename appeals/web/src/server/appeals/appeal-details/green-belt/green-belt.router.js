import { Router as createRouter } from 'express';
import * as controllers from './green-belt.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(asyncHandler(controllers.getChangeGreenBelt))
	.post(asyncHandler(controllers.postGreenBelt));

export default router;
