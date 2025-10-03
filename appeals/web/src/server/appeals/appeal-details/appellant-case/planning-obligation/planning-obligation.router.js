import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './planning-obligation.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/status/change')
	.get(asyncHandler(controllers.getChangePlanningObligationStatus))
	.post(asyncHandler(controllers.postChangePlanningObligationStatus));

export default router;
