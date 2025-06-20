import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import * as controller from './assign-user.controller.js';
import * as validators from './assign-user.validator.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter({ mergeParams: true });

router
	.route('/search-case-officer')
	.get(asyncHandler(controller.getAssignCaseOfficer))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateUser(),
		asyncHandler(controller.postAssignCaseOfficer)
	);

export default router;
