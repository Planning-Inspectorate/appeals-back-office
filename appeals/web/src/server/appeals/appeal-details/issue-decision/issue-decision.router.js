import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './issue-decision.controller.js';
import * as validators from './issue-decision.validators.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import {
	clearIssueDecisionCache,
	setSpecificDecisionType
} from '#appeals/appeal-details/issue-decision/issue-decision.middleware.js';
import {
	DECISION_TYPE_APPELLANT_COSTS,
	DECISION_TYPE_LPA_COSTS
} from '@pins/appeals/constants/support.js';

const router = createRouter({ mergeParams: true });

router.use(clearIssueDecisionCache);

router
	.route('/decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderIssueDecision)
	)
	.post(
		validators.validateDecision,
		validators.validateInvalidReason,
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postIssueDecision)
	);

router
	.route('/decision-letter-upload')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderDecisionLetterUpload)
	)
	.post(
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
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postAppellantCostsDecision)
	);

router
	.route('/appellant-costs-decision-letter-upload')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderAppellantCostsDecisionLetterUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postAppellantCostsDecisionLetterUpload)
	);

router
	.route('/issue-appellant-costs-decision-letter-upload')
	.get(
		setSpecificDecisionType(DECISION_TYPE_APPELLANT_COSTS),
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderAppellantCostsDecisionLetterUpload)
	)
	.post(
		setSpecificDecisionType(DECISION_TYPE_APPELLANT_COSTS),
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
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postLpaCostsDecision)
	);

router
	.route('/lpa-costs-decision-letter-upload')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderLpaCostsDecisionLetterUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postLpaCostsDecisionLetterUpload)
	);

router
	.route('/issue-lpa-costs-decision-letter-upload')
	.get(
		setSpecificDecisionType(DECISION_TYPE_LPA_COSTS),
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderLpaCostsDecisionLetterUpload)
	)
	.post(
		setSpecificDecisionType(DECISION_TYPE_LPA_COSTS),
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postLpaCostsDecisionLetterUpload)
	);

router
	.route('/check-your-decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderCheckDecision)
	)
	.post(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCheckDecision)
	);

router
	.route('/check-your-appellant-costs-decision')
	.get(
		setSpecificDecisionType(DECISION_TYPE_APPELLANT_COSTS),
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderCostsCheckDecision)
	)
	.post(
		setSpecificDecisionType(DECISION_TYPE_APPELLANT_COSTS),
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCostsCheckDecision)
	);

router
	.route('/check-your-lpa-costs-decision')
	.get(
		setSpecificDecisionType(DECISION_TYPE_LPA_COSTS),
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderCostsCheckDecision)
	)
	.post(
		setSpecificDecisionType(DECISION_TYPE_LPA_COSTS),
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCostsCheckDecision)
	);

router
	.route('/view-decision')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.renderViewDecision)
	);

export default router;
