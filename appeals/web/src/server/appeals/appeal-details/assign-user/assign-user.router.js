import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import { asyncHandler } from '@pins/express';
import { assertGroupAccess } from '#app/auth/auth.guards.js';
import * as controller from './assign-user.controller.js';
import * as validators from './assign-user.validator.js';

const assignUserRouter = createRouter({ mergeParams: true });

assignUserRouter
	.route('/case-officer')
	.get(asyncHandler(controller.getAssignCaseOfficer))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validateSearchTerm,
		asyncHandler(controller.postAssignCaseOfficer)
	);

assignUserRouter
	.route('/inspector')
	.get(asyncHandler(controller.getAssignInspector))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validateSearchTerm,
		asyncHandler(controller.postAssignInspector)
	);

assignUserRouter
	.route('/case-officer/:assigneeId/confirm')
	.get(asyncHandler(controller.getAssignCaseOfficerCheckAndConfirm))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validatePostConfirmation(),
		asyncHandler(controller.postAssignCaseOfficerCheckAndConfirm)
	);

assignUserRouter
	.route('/inspector/:assigneeId/confirm')
	.get(asyncHandler(controller.getAssignInspectorCheckAndConfirm))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validatePostConfirmation(false, true),
		asyncHandler(controller.postAssignInspectorCheckAndConfirm)
	);

const unassignUserRouter = createRouter({ mergeParams: true });

unassignUserRouter
	.route('/inspector/:assigneeId/confirm')
	.get(asyncHandler(controller.getUnassignInspectorCheckAndConfirm))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validatePostConfirmation(true, true),
		asyncHandler(controller.postUnassignInspectorCheckAndConfirm)
	);

const assignNewUserRouter = createRouter({ mergeParams: true });

assignNewUserRouter
	.route('/case-officer')
	.get(asyncHandler(controller.getAssignNewCaseOfficer))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validateNewUserPostConfirmation(),
		asyncHandler(controller.postAssignNewCaseOfficer)
	);

assignNewUserRouter
	.route('/inspector')
	.get(asyncHandler(controller.getAssignNewInspector))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validateNewUserPostConfirmation(true),
		asyncHandler(controller.postAssignNewInspector)
	);

export { assignUserRouter, unassignUserRouter, assignNewUserRouter };
