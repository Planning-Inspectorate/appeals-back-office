import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './schedule.controller.js';
import * as validators from './schedule.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(controller.getKnowDateTime)
	.post(
		validators.validateKnowDateTime,
		asyncHandler(controller.postKnowDateTime)
	);

router
	.route('/schedule-visit-date')
	.get(controller.getScheduleVisitDateTime)
	.post( asyncHandler(controller.postScheduleVisitDateTime));


router
	.route('/check-details')
	.get(controller.getSiteVisitCheckDetails)
	.post(controller.postSiteVisitCheckDetails);

export default router;
