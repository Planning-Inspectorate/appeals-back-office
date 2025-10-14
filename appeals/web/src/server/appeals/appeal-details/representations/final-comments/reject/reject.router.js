import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

import * as controller from './reject.controller.js';

import { validateRejectReason, validateRejectionReasonTextItems } from './reject.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.renderSelectReason))
	.post(
		(/** @type {import('@pins/express/types/express.js').Request} */ req, res, next) =>
			validateRejectReason(req.params.finalCommentsType)(req, res, next),
		validateRejectionReasonTextItems,
		saveBodyToSession('rejectFinalComments'),
		asyncHandler(controller.postRejectReason)
	);

router
	.route('/confirm')
	.get(asyncHandler(controller.getConfirmRejectFinalComment))
	.post(asyncHandler(controller.postConfirmRejectFinalComment));

export default router;
