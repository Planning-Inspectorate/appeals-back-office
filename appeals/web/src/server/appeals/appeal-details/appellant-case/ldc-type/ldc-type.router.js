import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './ldc-type.controller.js';
import { validateIncompleteReason } from './ldc-type.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getApplicationMadeUnderActSection))
	.post(validateIncompleteReason, asyncHandler(controllers.postApplicationMadeUnderActSection));

export default router;
