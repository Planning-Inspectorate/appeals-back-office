import { Router as createRouter } from 'express';
import * as controllers from './designated-sites.controller.js';
import { asyncHandler } from '@pins/express';
import { validateChangeInNearOrLikelyToAffectDesignatedSites } from './designated-sites.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeInNearOrLikelyToAffectDesignatedSites))
	.post(
		validateChangeInNearOrLikelyToAffectDesignatedSites,
		asyncHandler(controllers.postChangeInNearOrLikelyToAffectDesignatedSites)
	);

export default router;
