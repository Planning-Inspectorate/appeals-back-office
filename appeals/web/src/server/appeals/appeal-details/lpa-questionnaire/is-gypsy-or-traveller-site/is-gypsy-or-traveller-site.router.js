import { Router as createRouter } from 'express';
import * as controllers from './is-gypsy-or-traveller-site.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsGypsyOrTravellerSite))
	.post(asyncHandler(controllers.postChangeIsGypsyOrTravellerSite));

export default router;
