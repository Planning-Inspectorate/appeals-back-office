import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './ldc-type.controller.js';
import { validateIncompleteReason } from './ldc-type.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getAppealUnderActSection))
	.post(validateIncompleteReason, asyncHandler(controllers.postAppealUnderActSection));

export default router;
