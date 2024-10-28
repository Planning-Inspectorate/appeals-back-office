import { Router as createRouter } from 'express';
import * as controllers from './affects-scheduled-monument.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeAffectsScheduledMonument))
	.post(asyncHandler(controllers.postChangeAffectsScheduledMonument));

export default router;
