import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './special-control-of-advertisement.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeSpecialControlOfAdvertisment))
	.post(asyncHandler(controllers.postChangeSpecialControlOfAdvertisment));

export default router;
