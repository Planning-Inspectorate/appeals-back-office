import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './reject.controller.js';
import {
	validateAllowResubmit,
	validateRejectReason,
	validateRejectionReasonTextItems
} from './reject.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/select-reason')
	.get(asyncHandler(controller.renderSelectReason))
	.post(
		validateRejectReason,
		validateRejectionReasonTextItems,
		asyncHandler(controller.postRejectReason)
	);

router
	.route('/allow-resubmit')
	.get(asyncHandler(controller.renderAllowResubmit))
	.post(validateAllowResubmit, asyncHandler(controller.postAllowResubmit));

router
	.route('/check-your-answers')
	.get(asyncHandler(controller.renderCheckYourAnswers))
	.post(asyncHandler(controller.postRejectInterestedPartyComment));

export default router;
