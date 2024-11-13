import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './issue-decision.controller.js';
import * as validators from './issue-decision.validators.js';
import { createTextAreaSanitizer } from '#lib/sanitizers/textarea-sanitizer.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter({ mergeParams: true });

router
	.route('/decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.getIssueDecision)
	)
	.post(
		validators.validateDecision,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postIssueDecision)
	);

router
	.route('/decision-letter-upload')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.getDecisionLetterUpload)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postDecisionLetterUpload)
	);

router
	.route('/decision-letter-date')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.getDateDecisionLetter)
	)
	.post(
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateDueDateInPastOrToday,
		validators.validateDecisionDateIsBusinessDay,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postDateDecisionLetter)
	);

router
	.route('/invalid-reason')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.getInvalidReason)
	)
	.post(
		createTextAreaSanitizer('decisionInvalidReason'),
		validators.validateTextArea,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postInvalidReason)
	);

router
	.route('/check-your-decision')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.getCheckDecision)
	)
	.post(
		validateAppeal,
		validators.validateCheckDecision,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCheckDecision)
	);

router
	.route('/check-invalid-decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.getCheckInvalidDecision)
	)
	.post(
		validators.validateCheckDecision,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCheckInvalidDecision)
	);

router.route('/decision-sent').get(asyncHandler(controller.getDecisionSent));

export default router;
