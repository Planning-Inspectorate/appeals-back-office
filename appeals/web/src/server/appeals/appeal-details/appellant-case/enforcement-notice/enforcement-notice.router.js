import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './enforcement-notice.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeEnforcementNotice))
	.post(asyncHandler(controllers.postChangeEnforcementNotice));

export default router;
