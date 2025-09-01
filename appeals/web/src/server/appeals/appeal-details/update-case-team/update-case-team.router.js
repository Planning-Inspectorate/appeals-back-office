import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './update-case-team.controller.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { validateCaseTeamSelection } from './update-case-team.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/edit')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getSelectCaseTeam)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validateCaseTeamSelection,
		asyncHandler(controller.postSelectCaseTeam)
	);

router.route('/edit/check').get().post();

export default router;
