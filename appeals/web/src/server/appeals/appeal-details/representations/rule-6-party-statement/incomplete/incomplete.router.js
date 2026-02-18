import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { Router } from 'express';
import {
	validateRejectionReasonTextItems,
	validateRejectReason
} from '../../common/validators/reject.validators.js';
import {
	postCheckYourAnswers,
	postReasons,
	postSetNewDate,
	renderCheckYourAnswers,
	renderReasons,
	renderSetNewDate
} from './incomplete.controller.js';
import { validateSetNewDate } from './incomplete.validator.js';

const router = Router({ mergeParams: true });

router
	.route('/reasons')
	.get(renderReasons)
	.post(
		validateRejectReason('Select why the statement is incomplete'),
		validateRejectionReasonTextItems,
		saveBodyToSession('rule6PartyStatement', { scopeToAppeal: true }),
		postReasons
	);

router
	.route('/date')
	.get(renderSetNewDate)
	.post(
		validateSetNewDate,
		saveBodyToSession('rule6PartyStatement', { scopeToAppeal: true }),
		postSetNewDate
	);

router.route('/confirm').get(renderCheckYourAnswers).post(postCheckYourAnswers);

export default router;
