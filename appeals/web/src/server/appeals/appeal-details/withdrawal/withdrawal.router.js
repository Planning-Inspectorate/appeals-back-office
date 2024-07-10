import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controller from './withdrawal.controller.js';
import * as validators from './withdrawal.validators.js';

const router = createRouter({ mergeParams: true });

router.route('/view').get(asyncRoute(controller.getViewWithdrawalDocumentFolder));

router
	.route('/start')
	.get(asyncRoute(controller.getWithdrawalRequestUpload))
	.post(asyncRoute(controller.postWithdrawalRequestRequestUpload));

router
	.route('/withdrawal-request-date')
	.get(asyncRoute(controller.getDateWithdrawalRequest))
	.post(
		validators.validateRequestDateFields,
		validators.validateRequestDateValid,
		validators.validateDueDateInPastOrToday,
		asyncRoute(controller.postDateWithdrawalRequest)
	);

router
	.route('/redaction-status')
	.get(asyncRoute(controller.getRedactionStatus))
	.post(validators.validateRedactionStatus, asyncRoute(controller.postRedactionStatus));

router
	.route('/check-your-answers')
	.get(asyncRoute(controller.getCheckYourAnswers))
	.post(validators.validateCheckYourAnswers, asyncRoute(controller.postCheckYourAnswers));

router.route('/confirmation').get(asyncRoute(controller.getConfirmation));

export default router;
