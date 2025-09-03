import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './reject.controller.js';
import { initialiseSession } from './reject.middleware.js';
import {
	validateAllowResubmit,
	validateRejectReason,
	validateRejectionReasonTextItems
} from '../../../common/validators/reject.validators.js';

const router = createRouter({ mergeParams: true });

router.use(initialiseSession);

router
	.route('/select-reason')
	.get(asyncHandler(controller.renderSelectReason))
	.post(
		validateRejectReason(),
		validateRejectionReasonTextItems,
		saveBodyToSession('rejectIpComment'),
		asyncHandler(controller.postRejectReason)
	);

router
	.route('/allow-resubmit')
	.get(asyncHandler(controller.renderAllowResubmit))
	.post(
		validateAllowResubmit,
		saveBodyToSession('rejectIpComment'),
		asyncHandler(controller.postAllowResubmit)
	);

router
	.route('/check-your-answers')
	.get(asyncHandler(controller.renderCheckYourAnswers))
	.post(asyncHandler(controller.postRejectInterestedPartyComment));

export default router;
