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
	.post(validateRejectReason(), validateRejectionReasonTextItems, postReasons);

router.route('/date').get(renderSetNewDate).post(validateSetNewDate, postSetNewDate);

router.route('/confirm').get(renderCheckYourAnswers).post(postCheckYourAnswers);

export default router;
