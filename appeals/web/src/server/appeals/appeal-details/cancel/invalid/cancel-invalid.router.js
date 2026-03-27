import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './cancel-invalid.controller.js';
import * as validators from './cancel-invalid.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/reason')
	.get(asyncHandler(controller.getInvalidReason))
	.post(
		saveBodyToSession('cancelAppeal', { scopeToAppeal: true }),
		validators.validateInvalidReason,
		validators.validateInvalidReasonTextItems,
		asyncHandler(controller.postInvalidReason)
	);

router
	.route('/other-live-appeals')
	.get(asyncHandler(controller.getOtherLiveAppeals))
	.post(
		saveBodyToSession('cancelAppeal', { scopeToAppeal: true }),
		validators.validateOtherLiveAppeals,
		asyncHandler(controller.postOtherLiveAppeals)
	);

router
	.route('/check-details')
	.get(asyncHandler(controller.getCheckDetails))
	.post(asyncHandler(controller.postCheckDetails));

export default router;
