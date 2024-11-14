import { Router as createRouter } from 'express';
import * as controllers from './has-community-infrastructure-levy.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHasCommunityInfrastructureLevy))
	.post(asyncHandler(controllers.postChangeHasCommunityInfrastructureLevy));

export default router;
