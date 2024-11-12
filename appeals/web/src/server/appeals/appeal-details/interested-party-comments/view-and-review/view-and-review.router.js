import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './view-and-review.controller.js';
import {
	validateAllowResubmit,
	validateRejectionReasonTextItems,
	validateRejectReason,
	validateReviewComment
} from './view-and-review.validators.js';

const router = createRouter({ mergeParams: true });

router.route('/view').get(asyncHandler(controller.renderViewInterestedPartyComment));

router
	.route('/review')
	.get(asyncHandler(controller.renderReviewInterestedPartyComment))
	.post(validateReviewComment, asyncHandler(controller.postReviewInterestedPartyComment));

router
	.route('/reject-reason')
	.get(asyncHandler(controller.renderRejectReason))
	.post(
		validateRejectReason,
		validateRejectionReasonTextItems,
		asyncHandler(controller.postRejectReason)
	);

router
	.route('/reject-allow-resubmit')
	.get(asyncHandler(controller.renderAllowResubmit))
	.post(validateAllowResubmit, asyncHandler(controller.postAllowResubmit));

export default router;
