import { Router as createRouter } from 'express';
import * as controllers from './has-protected-species.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHasProtectedSpecies))
	.post(asyncHandler(controllers.postChangeHasProtectedSpecies));

export default router;
