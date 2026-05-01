import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './schedule.controller.js';
import * as validators from './schedule.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(controller.getKnowDateTime)
	.post(validators.validateKnowDateTime, asyncHandler(controller.postKnowDateTime));

router
	.route('/schedule-visit-date')
	.get(controller.getScheduleVisitDateTime)
	.post(
		validators.validateVisitDateFields,
		validators.validateVisitDateValid,
		validators.validateVisitStartTime,
		validators.validateVisitEndTime,
		validators.validateVisitStartTimeBeforeEndTime,
		extractAndProcessDateErrors({ fieldNamePrefix: 'visit-date' }),
		asyncHandler(controller.postScheduleVisitDateTime)
	);

router
	.route('/check-details')
	.get(controller.getSiteVisitCheckDetails)
	.post(controller.postSiteVisitCheckDetails);

export default router;
