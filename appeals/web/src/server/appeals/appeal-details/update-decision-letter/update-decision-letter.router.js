import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	postDecisionLetterUpload,
	renderDecisionLetterUpload
} from '../issue-decision/issue-decision.controller.js';
import * as updateDecisionLetterController from './update-decision-letter.controller.js';
import { updateCorrectionNoticeValidator } from './update-decision-letter.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/correction-notice')
	.get(
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(updateDecisionLetterController.getCorrectionNotice)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		updateCorrectionNoticeValidator,
		asyncHandler(updateDecisionLetterController.postCorrectionNotice)
	);
router
	.route('/check-details')
	.get(
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(updateDecisionLetterController.getUpdateDocumentCheckDetails)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(updateDecisionLetterController.postUpdateDocumentCheckDetails)
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
