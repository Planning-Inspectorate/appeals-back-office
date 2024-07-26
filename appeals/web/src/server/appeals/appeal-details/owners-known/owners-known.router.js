import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './owners-known.controller.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeOwnersKnown))
	.post(validateAppeal, asyncHandler(controllers.postChangeOwnersKnown));

export default router;
