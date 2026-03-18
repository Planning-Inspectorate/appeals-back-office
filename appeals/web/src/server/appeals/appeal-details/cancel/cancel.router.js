import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './cancel.controller.js';
import { validateCancelReason } from './cancel.validators.js';
import enforcementNoticeWithdrawalRouter from './enforcement-notice-withdrawal/enforcement-notice-withdrawal.router.js';
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

router.use('/enforcement-notice-withdrawal', enforcementNoticeWithdrawalRouter);
router.use('/invalid', invalidRouter);

router
	.route('/check-details')
	.get(asyncHandler(controller.getCheckYourAnswers))
	.post(asyncHandler(controller.postCheckYourAnswers));

export default router;
