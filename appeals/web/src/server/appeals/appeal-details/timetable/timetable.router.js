import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as timetableController from './timetable.controller.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { permissionNames } from '#environment/permissions.js';
import { runTimetableValidators } from './timetable.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/edit')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(timetableController.getEditTimetable)
	)
	.post(
		validateAppeal,
		runTimetableValidators,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(timetableController.postEditTimetable)
	);

router
	.route('/edit/check')
	.get(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(timetableController.renderCheckYourAnswers)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(timetableController.postAppealTimetables)
	);
export default router;
