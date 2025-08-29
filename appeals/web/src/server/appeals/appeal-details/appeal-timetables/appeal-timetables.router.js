import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../appeal-details.middleware.js';
import { dueDateFieledName } from './appeal-timetable.constants.js';
import * as appealTimetablesController from './appeal-timetables.controller.js';
import * as validators from './appeal-timetables.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:timetableType')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(appealTimetablesController.getDueDate)
	)
	.post(
		validateAppeal,
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInFuture,
		assertUserHasPermission(permissionNames.updateCase),
		extractAndProcessDateErrors({
			fieldNamePrefix: dueDateFieledName
		}),
		asyncHandler(appealTimetablesController.postDueDate)
	);

export default router;
