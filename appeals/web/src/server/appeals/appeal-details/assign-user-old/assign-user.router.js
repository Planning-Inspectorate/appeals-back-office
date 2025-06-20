import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import * as controller from './assign-user.controller.js';
import * as validators from './assign-user.validator.js';
import { permissionNames } from '#environment/permissions.js';

const assignUserRouterOld = createRouter({ mergeParams: true });

assignUserRouterOld
	.route('/case-officer')
	.get(asyncHandler(controller.getAssignCaseOfficer))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateSearchTerm,
		asyncHandler(controller.postAssignCaseOfficer)
	);

assignUserRouterOld
	.route('/inspector')
	.get(asyncHandler(controller.getAssignInspector))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateSearchTerm,
		asyncHandler(controller.postAssignInspector)
	);

assignUserRouterOld
	.route('/case-officer/:assigneeId/confirm')
	.get(asyncHandler(controller.getAssignCaseOfficerCheckAndConfirm))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validatePostConfirmation(),
		asyncHandler(controller.postAssignCaseOfficerCheckAndConfirm)
	);

assignUserRouterOld
	.route('/inspector/:assigneeId/confirm')
	.get(asyncHandler(controller.getAssignInspectorCheckAndConfirm))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validatePostConfirmation(false, true),
		asyncHandler(controller.postAssignInspectorCheckAndConfirm)
	);

const unassignUserRouter = createRouter({ mergeParams: true });

unassignUserRouter
	.route('/inspector/:assigneeId/confirm')
	.get(asyncHandler(controller.getUnassignInspectorCheckAndConfirm))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validatePostConfirmation(true, true),
		asyncHandler(controller.postUnassignInspectorCheckAndConfirm)
	);

const assignNewUserRouter = createRouter({ mergeParams: true });

assignNewUserRouter
	.route('/case-officer')
	.get(asyncHandler(controller.getAssignNewCaseOfficer))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateNewUserPostConfirmation(),
		asyncHandler(controller.postAssignNewCaseOfficer)
	);

assignNewUserRouter
	.route('/inspector')
	.get(asyncHandler(controller.getAssignNewInspector))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateNewUserPostConfirmation(true),
		asyncHandler(controller.postAssignNewInspector)
	);

export { assignUserRouterOld, unassignUserRouter, assignNewUserRouter };
