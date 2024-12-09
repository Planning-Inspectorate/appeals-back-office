import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './neighbouring-site-access.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeNeighbouringSiteAccess))
	.post(asyncHandler(controllers.postChangeNeighbouringSiteAccess));

export default router;
