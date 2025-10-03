import * as validators from '#appeals/appeal-details/inquiry/setup/set-up-inquiry-validators.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './change-procedure-estimation.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getChangeInquiryEstimation))
	.post(
		validators.validateYesNoInput,
		validators.validateEstimationInput,
		saveBodyToSession('changeProcedureType'),
		asyncHandler(controller.postChangeInquiryEstimation)
	);

export default router;
