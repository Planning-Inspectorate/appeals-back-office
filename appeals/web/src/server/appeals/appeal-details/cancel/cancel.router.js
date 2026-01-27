import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './cancel.controller.js';
import { validateCancelReason } from './cancel.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getCancelAppealPage))
	.post(
		validateCancelReason,
		saveBodyToSession('cancelAppeal', { scopeToAppeal: true }),
		asyncHandler(controller.postCancelAppeal)
	);

export default router;
