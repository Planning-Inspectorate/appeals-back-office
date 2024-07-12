import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './issue-decision.controller.js';
import * as validators from './issue-decision.validators.js';
import { createTextAreaSanitizer } from '#lib/sanitizers/textarea-sanitizer.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/decision')
	.get(asyncHandler(controller.getIssueDecision))
	.post(validators.validateDecision, asyncHandler(controller.postIssueDecision));

router
	.route('/decision-letter-upload')
	.get(validateAppeal, asyncHandler(controller.getDecisionLetterUpload))
	.post(validateAppeal, asyncHandler(controller.postDecisionLetterUpload));

router
	.route('/decision-letter-date')
	.get(asyncHandler(controller.getDateDecisionLetter))
	.post(
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateDueDateInPastOrToday,
		asyncHandler(controller.postDateDecisionLetter)
	);

router
	.route('/invalid-reason')
	.get(asyncHandler(controller.getInvalidReason))
	.post(
		createTextAreaSanitizer('decisionInvalidReason'),
		validators.validateTextArea,
		asyncHandler(controller.postInvalidReason)
	);

router
	.route('/check-your-decision')
	.get(validateAppeal, asyncHandler(controller.getCheckDecision))
	.post(
		validateAppeal,
		validators.validateCheckDecision,
		asyncHandler(controller.postCheckDecision)
	);

router
	.route('/check-invalid-decision')
	.get(asyncHandler(controller.getCheckInvalidDecision))
	.post(validators.validateCheckDecision, asyncHandler(controller.postCheckInvalidDecision));

router.route('/decision-sent').get(asyncHandler(controller.getDecisionSent));

export default router;
