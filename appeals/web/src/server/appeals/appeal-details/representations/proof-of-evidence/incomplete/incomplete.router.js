import {
	validateIncompleteReason,
	validateIncompleteReasonTextItems,
	validateOtherReasonInput
} from '#appeals/appeal-details/representations/proof-of-evidence/incomplete/incomplete.validator.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	postConfirm,
	postReasons,
	redirectAndClearSession,
	renderConfirm,
	renderReasons
} from './incomplete.controller.js';

const router = createRouter({ mergeParams: true });

router.route('/').get(redirectAndClearSession('/reasons', 'proofOfEvidence'));

router
	.route('/reasons')
	.get(asyncHandler(renderReasons))
	.post(
		validateIncompleteReason('Select why the proof of evidence and witnesses are incomplete'),
		validateIncompleteReasonTextItems,
		validateOtherReasonInput,
		saveBodyToSession('proofOfEvidence', { scopeToAppeal: true }),
		asyncHandler(postReasons)
	);

router.route('/confirm').get(asyncHandler(renderConfirm)).post(asyncHandler(postConfirm));

export default router;
