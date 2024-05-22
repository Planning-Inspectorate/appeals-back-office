import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controller from './issue-decision.controller.js';
import * as validators from './issue-decision.validators.js';
import { createTextAreaSanitizer } from '#lib/sanitizers/textarea-sanitizer.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/decision')
	.get(asyncRoute(controller.getIssueDecision))
	.post(validators.validateDecision, asyncRoute(controller.postIssueDecision));

router
	.route('/decision-letter-upload')
	.get(validateAppeal, asyncRoute(controller.getDecisionLetterUpload))
	.post(validateAppeal, asyncRoute(controller.postDecisionLetterUpload));

router
	.route('/decision-letter-date')
	.get(asyncRoute(controller.getDateDecisionLetter))
	.post(
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateDueDateInPastOrToday,
		asyncRoute(controller.postDateDecisionLetter)
	);

router
	.route('/invalid-reason')
	.get(asyncRoute(controller.getInvalidReason))
	.post(
		createTextAreaSanitizer('decisionInvalidReason'),
		validators.validateTextArea,
		asyncRoute(controller.postInvalidReason)
	);

router
	.route('/check-your-decision')
	.get(validateAppeal, asyncRoute(controller.getCheckDecision))
	.post(validateAppeal, validators.validateCheckDecision, asyncRoute(controller.postCheckDecision));

router
	.route('/check-invalid-decision')
	.get(asyncRoute(controller.getCheckInvalidDecision))
	.post(validators.validateCheckDecision, asyncRoute(controller.postCheckInvalidDecision));

router.route('/decision-sent').get(asyncRoute(controller.getDecisionSent));

export default router;
