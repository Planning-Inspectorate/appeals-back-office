import { Router as createRouter } from 'express';
import config from '#environment/config.js';
import { asyncHandler } from '@pins/express';
import { assertGroupAccess } from '#app/auth/auth.guards.js';
import * as validators from './site-visit.validators.js';
import * as controller from './site-visit.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/schedule-visit')
	.get(asyncHandler(controller.getScheduleSiteVisit))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validateSiteVisitType,
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateVisitDateInFuture,
		validators.validateVisitStartTime,
		validators.validateVisitEndTime,
		validators.validateVisitStartTimeBeforeEndTime,
		asyncHandler(controller.postScheduleSiteVisit)
	);

router
	.route('/manage-visit')
	.get(asyncHandler(controller.getManageSiteVisit))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validateSiteVisitType,
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateVisitDateInFuture,
		validators.validateVisitStartTime,
		validators.validateVisitEndTime,
		validators.validateVisitStartTimeBeforeEndTime,
		asyncHandler(controller.postManageSiteVisit)
	);

router
	.route('/visit-scheduled/:confirmationPageTypeToRender')
	.get(asyncHandler(controller.getSiteVisitScheduled));

router
	.route('/set-visit-type')
	.get(asyncHandler(controller.getSetVisitType))
	.post(
		assertGroupAccess(
			config.referenceData.appeals.caseOfficerGroupId,
			config.referenceData.appeals.inspectorGroupId
		),
		validators.validateSiteVisitType,
		asyncHandler(controller.postSetVisitType)
	);

router.route('/visit-booked').get(asyncHandler(controller.getSiteVisitBooked));

export default router;
