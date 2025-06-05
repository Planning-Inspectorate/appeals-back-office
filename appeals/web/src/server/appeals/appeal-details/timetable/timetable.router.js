import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as timetableController from './timetable.controller.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { permissionNames } from '#environment/permissions.js';
import { addAppellantCaseToLocals, runTimetableValidators } from './timetable.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/edit')
	.get(
		validateAppeal,
		addAppellantCaseToLocals,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(timetableController.getEditTimetable)
	)
	.post(
		validateAppeal,
		addAppellantCaseToLocals,
		runTimetableValidators,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(timetableController.postEditTimetable)
	);

router
	.route('/edit/check')
	.get(
		validateAppeal,
		addAppellantCaseToLocals,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(timetableController.renderCheckYourAnswers)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(timetableController.postAppealTimetables)
	);
export default router;
