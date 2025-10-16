import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import * as validators from '#appeals/appeal-details/assign-user/assign-user.validator.js';
import { permissionNames } from '#environment/permissions.js';
import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './search-case-officer.controller.js';

const router = createRouter();

router
	.route('/')
	.get(saveBackUrl('personal-list'), asyncHandler(controller.renderViewSearchCaseOfficer))
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateUser(),
		asyncHandler(controller.postAssignCaseOfficer)
	);

export default router;
