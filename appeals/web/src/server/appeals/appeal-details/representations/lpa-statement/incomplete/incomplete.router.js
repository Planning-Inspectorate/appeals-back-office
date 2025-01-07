import { Router } from 'express';
import { postReasons, renderCheckYourAnswers, renderReasons } from './incomplete.controller.js';
import {
	validateRejectionReasonTextItems,
	validateRejectReason
} from '../../common/validators/reject.validators.js';

const router = Router({ mergeParams: true });

router.get('/reasons', renderReasons);
router.post('/reasons', validateRejectReason, validateRejectionReasonTextItems, postReasons);

router.get('/confirm', renderCheckYourAnswers);

export default router;
