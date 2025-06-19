import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { permissionNames } from '#environment/permissions.js';
import * as updateDecisionLetterController from './update-decision-letter.controller.js';
import { updateCorrectionNoticeValidator } from './update-decision-letter.validator.js';
import {
	postDecisionLetterUpload,
	renderDecisionLetterUpload
} from '../issue-decision/issue-decision.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/correction-notice')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(updateDecisionLetterController.getCorrectionNotice)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		updateCorrectionNoticeValidator,
		asyncHandler(updateDecisionLetterController.postCorrectionNotice)
	);

router
	.route('/upload-decision-letter')
	.get(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(renderDecisionLetterUpload)
	)
	.post(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(postDecisionLetterUpload)
	);

export default router;
