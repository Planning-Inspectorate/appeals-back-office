import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import scheduleRouter from './schedule/schedule.router.js';
import * as controller from './site-visit.controller.js';
import * as validators from './site-visit.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/schedule-visit')
	.get(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.getTypeOfSiteVisit)
	)
	.post(
		assertUserHasPermission(permissionNames.setEvents),
		validators.validateSiteVisitType,
		asyncHandler(controller.postTypeOfSiteVisit)
	);

router.use('/schedule', assertUserHasPermission(permissionNames.updateCase), scheduleRouter);

router
	.route('/delete')
	.get(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.getCancelSiteVisit)
	)
	.post(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.postCancelSiteVisit)
	);

router
	.route('/missed')
	.get(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.getSiteVisitMissed)
	)
	.post(
		assertUserHasPermission(permissionNames.setEvents),
		validators.validateWhoMissedSiteVisit,
		asyncHandler(controller.postSiteVisitMissed)
	);

router
	.route('/missed/check')
	.get(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.getSiteVisitMissedCya)
	)
	.post(
		assertUserHasPermission(permissionNames.setEvents),
		asyncHandler(controller.postSiteVisitMissedCya)
	);

export default router;
