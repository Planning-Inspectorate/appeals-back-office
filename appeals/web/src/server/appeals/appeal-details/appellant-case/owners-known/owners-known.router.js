import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import * as controllers from './owners-known.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeOwnersKnown))
	.post(validateAppeal, asyncHandler(controllers.postChangeOwnersKnown));

export default router;
