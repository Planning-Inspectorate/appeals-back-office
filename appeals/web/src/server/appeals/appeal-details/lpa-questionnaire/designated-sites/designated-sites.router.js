import { Router as createRouter } from 'express';
import * as controllers from './designated-sites.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeInNearOrLikelyToAffectDesignatedSites))
	.post(asyncHandler(controllers.postChangeInNearOrLikelyToAffectDesignatedSites));

export default router;
