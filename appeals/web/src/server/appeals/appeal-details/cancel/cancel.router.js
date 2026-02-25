import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './cancel.controller.js';
import { validateCancelReason } from './cancel.validators.js';
import invalidRouter from './invalid/cancel-invalid.router.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getCancelAppealPage))
	.post(
		validateCancelReason,
		saveBodyToSession('cancelAppeal', { scopeToAppeal: true }),
		asyncHandler(controller.postCancelAppeal)
	);

router.use('/invalid', invalidRouter);

export default router;
