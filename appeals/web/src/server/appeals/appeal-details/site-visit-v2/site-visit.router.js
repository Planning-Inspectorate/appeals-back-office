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
export default router;
