import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import {
	validateIncompleteReason,
	validateIncompleteReasonTextItems
} from '#appeals/appeal-details/representations/proof-of-evidence/incomplete/incomplete.validator.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postReasons, redirectAndClearSession, renderReasons } from './incomplete.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/').get(redirectAndClearSession('/reasons', 'proofOfEvidence'));

router
	.route('/reasons')
	.get(validateAppeal, asyncHandler(renderReasons))
	.post(
		validateAppeal,
		validateIncompleteReason('Select why the proof of evidence and witnesses are incomplete'),
		validateIncompleteReasonTextItems,
		saveBodyToSession('proofOfEvidence', { scopeToAppeal: true }),
		asyncHandler(postReasons)
	);

export default router;
