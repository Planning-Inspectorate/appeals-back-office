import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './any-significant-changes.controller.js';
import { validateSignificantChanges } from './any-significant-changes.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeSignificantChanges))
	.post(validateSignificantChanges, asyncHandler(controllers.postChangeSignificantChanges));

export default router;
