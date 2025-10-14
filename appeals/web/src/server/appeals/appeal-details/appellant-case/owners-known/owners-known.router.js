import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './owners-known.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeOwnersKnown))
	.post(asyncHandler(controllers.postChangeOwnersKnown));

export default router;
