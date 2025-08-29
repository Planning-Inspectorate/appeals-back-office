import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './is-gypsy-or-traveller-site.controller.js';
import { validateGypsyOrTravellerSite } from './is-gypsy-or-traveller-site.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsGypsyOrTravellerSite))
	.post(validateGypsyOrTravellerSite, asyncHandler(controllers.postChangeIsGypsyOrTravellerSite));

export default router;
