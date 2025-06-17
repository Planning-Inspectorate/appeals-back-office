import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './set-up-inquiry.controller.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import * as validators from './set-up-inquiry-validators.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/date', 'setUpInquiry'));

router
	.route('/date')
	.get(asyncHandler(controller.getInquiryDate))
	.post(
		validators.validateInquiryDateTime,
		saveBodyToSession('setUpInquiry'),
		asyncHandler(controller.postInquiryDate)
	);

export default router;
