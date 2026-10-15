import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { fieldNameSubmissionDate, sessionKeyCreateCase } from './create-case.constants.js';
import * as controller from './create-case.controller.js';
import * as validators from './create-case.validators.js';

const router = createRouter();

router.get(
	'/',
	assertUserHasPermission(permissionNames.updateCase),
	controller.redirectAndClearSession('/select-case-type', sessionKeyCreateCase)
);

router
	.route('/select-case-type')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getSelectCaseType)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateCaseType,
		saveBodyToSession(sessionKeyCreateCase),
		asyncHandler(controller.postSelectCaseType)
	);

router
	.route('/submission-date')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getSubmissionDate)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		validators.validateSubmissionDateFields,
		validators.validateSubmissionDateValid,
		validators.validateSubmissionDateInPastOrToday,
		extractAndProcessDateErrors({ fieldNamePrefix: fieldNameSubmissionDate }),
		validators.overrideDateErrorMessage,
		saveBodyToSession(sessionKeyCreateCase),
		asyncHandler(controller.postSubmissionDate)
	);

router
	.route('/check-details')
	.get(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.getCheckDetails)
	)
	.post(
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(controller.postCheckDetails)
	);

export default router;
