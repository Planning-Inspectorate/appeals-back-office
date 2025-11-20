import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './enforcement-notice-listed-building.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeEnforcementNoticeListedBuilding))
	.post(asyncHandler(controllers.postChangeEnforcementNoticeListedBuilding));

export default router;
