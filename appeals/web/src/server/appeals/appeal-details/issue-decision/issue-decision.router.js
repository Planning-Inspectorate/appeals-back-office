import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './issue-decision.controller.js';
import * as validators from './issue-decision.validators.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter({ mergeParams: true });

router
	.route('/decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderIssueDecision)
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
		asyncHandler(controller.renderDecisionLetterUpload)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postDecisionLetterUpload)
	);

router
	.route('/appellant-costs-decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderAppellantCostsDecision)
	)
	.post(
		validators.validateAppellantCostsDecision,
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postAppellantCostsDecision)
	);

router
	.route('/appellant-costs-decision-letter-upload')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderAppellantCostsDecisionLetterUpload)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postAppellantCostsDecisionLetterUpload)
	);

router
	.route('/lpa-costs-decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderLpaCostsDecision)
	)
	.post(
		validators.validateLpaCostsDecision,
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postLpaCostsDecision)
	);

router
	.route('/lpa-costs-decision-letter-upload')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderLpaCostsDecisionLetterUpload)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postLpaCostsDecisionLetterUpload)
	);

router
	.route('/check-your-decision')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderCheckDecision)
	)
	.post(
		validateAppeal,
		validators.validateCheckDecision,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCheckDecision)
	);

export default router;
