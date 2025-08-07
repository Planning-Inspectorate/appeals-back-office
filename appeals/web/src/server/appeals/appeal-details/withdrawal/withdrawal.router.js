import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './withdrawal.controller.js';
import * as validators from './withdrawal.validators.js';

const router = createRouter({ mergeParams: true });

router.route('/view').get(asyncHandler(controller.getViewWithdrawalDocumentFolder));

router
	.route('/new')
	.get(asyncHandler(controller.getWithdrawalRequestUpload))
	.post(asyncHandler(controller.postWithdrawalRequestRequestUpload));

router
	.route('/new/check-your-answers')
	.get(asyncHandler(controller.getCheckYourAnswers))
	.post(validators.validateCheckYourAnswers, asyncHandler(controller.postCheckYourAnswers));

export default router;
