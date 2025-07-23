import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import * as validators from './site-visit.validators.js';
import * as controller from './site-visit.controller.js';
import { permissionNames } from '#environment/permissions.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { siteVisitDateField } from './site-visits.constants.js';

const router = createRouter({ mergeParams: true });

router
	.route('/schedule-visit')
	.get(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.getScheduleSiteVisit)
	)
	.post(
		assertUserHasPermission(permissionNames.setEvents),
		validators.validateSiteVisitType,
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateVisitStartTime,
		validators.validateVisitEndTime,
		validators.validateVisitStartTimeBeforeEndTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: siteVisitDateField
		}),
		asyncHandler(controller.postScheduleSiteVisit)
	);

router
	.route('/manage-visit')
	.get(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.getManageSiteVisit)
	)
	.post(
		assertUserHasPermission(permissionNames.setEvents),
		validators.validateSiteVisitType,
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateVisitStartTime,
		validators.validateVisitEndTime,
		validators.validateVisitStartTimeBeforeEndTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: siteVisitDateField
		}),
		asyncHandler(controller.postManageSiteVisit)
	);

router
	.route('/visit-scheduled/:confirmationPageTypeToRender')
	.get(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.getSiteVisitScheduled)
	);

router.route('/visit-booked').get(asyncHandler(controller.getSiteVisitBooked));

export default router;
