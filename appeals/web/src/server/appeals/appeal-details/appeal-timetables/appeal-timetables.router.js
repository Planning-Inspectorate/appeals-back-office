import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as appealTimetablesController from './appeal-timetables.controller.js';
import * as validators from './appeal-timetables.validators.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:timetableType')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncRoute(appealTimetablesController.getDueDate)
	)
	.post(
		validateAppeal,
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInFuture,
		assertUserHasPermission(permissionNames.updateCase),
		asyncRoute(appealTimetablesController.postDueDate)
	);

export default router;
