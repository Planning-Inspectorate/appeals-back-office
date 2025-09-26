import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { createTextAreaSanitizer } from '#lib/sanitizers/textarea-sanitizer.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../appeal-details.middleware.js';
import { issueDecisionDateField } from './issue-decision.constants.js';
import * as controller from './issue-decision.controller.js';
import * as validators from './issue-decision.validators.js';

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
		extractAndProcessDateErrors({
			fieldNamePrefix: issueDecisionDateField
		}),
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
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.getCheckDecision)
	)
	.post(
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

export default router;
