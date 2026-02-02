import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './cancel-enforcement.controller.js';
import * as validators from './cancel-enforcement.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/invalid')
	.get(asyncHandler(controller.getInvalidReason))
	.post(
		saveBodyToSession('cancelAppeal', { scopeToAppeal: true }),
		validators.validateInvalidReason,
		validators.validateInvalidReasonTextItems,
		asyncHandler(controller.postInvalidReason)
	);

export default router;
