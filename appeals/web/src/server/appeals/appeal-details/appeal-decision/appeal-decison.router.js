import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { permissionNames } from '#environment/permissions.js';
import * as appealDecisionController from './appeal-decision.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(appealDecisionController.getAppealDecision)
	);

export default router;
