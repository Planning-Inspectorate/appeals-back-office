import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';

import { postReasons, redirectAndClearSession, renderReasons } from './incomplete.controller.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import {
	validateRejectionReasonTextItems,
	validateRejectReason
} from '../../common/validators/reject.validators.js';

const router = createRouter({ mergeParams: true });

router.route('/').get(redirectAndClearSession('/reasons', 'proofOfEvidence'));

router
	.route('/reasons')
	.get(validateAppeal, asyncHandler(renderReasons))
	.post(
		validateAppeal,
		validateRejectReason('Select why the proof of evidence and witnesses are incomplete'),
		validateRejectionReasonTextItems,
		saveBodyToSession('proofOfEvidence', { scopeToAppeal: true }),
		asyncHandler(postReasons)
	);

export default router;
