import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './change-status.controller.js';
import { validateChangeStatus } from './change-status.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getChangeStatus))
	.post(validateChangeStatus, asyncHandler(controller.postChangeStatus));

export default router;
