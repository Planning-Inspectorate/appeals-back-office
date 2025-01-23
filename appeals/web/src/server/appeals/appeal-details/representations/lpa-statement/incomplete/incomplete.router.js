import { Router } from 'express';
import { postReasons, renderCheckYourAnswers, renderReasons, renderSetNewDate, postSetNewDate } from './incomplete.controller.js';
import {
	validateRejectionReasonTextItems,
	validateRejectReason
} from '../../common/validators/reject.validators.js';
import {
	validateSetNewDate
} from './incomplete.validator.js';
const router = Router({ mergeParams: true });

router.get('/reasons', renderReasons);
router.post('/reasons', validateRejectReason, validateRejectionReasonTextItems, postReasons);
router.get('/date', renderSetNewDate)
router.post('/date', validateSetNewDate, postSetNewDate)
router.get('/confirm', renderCheckYourAnswers);

export default router;
