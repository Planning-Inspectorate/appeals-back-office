import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './estimates.controller.js';
import * as validators from './estimates.validators.js';

const router = createRouter({ mergeParams: true });
const addRouter = createRouter({ mergeParams: true });
const changeRouter = createRouter({ mergeParams: true });

router.use('/add', addRouter);
router.use('/change', changeRouter);

addRouter.get('/', controller.redirectAndClearSession('/add/timings', 'hearingEstimates'));

addRouter
	.route('/timings')
	.get(asyncHandler(controller.getAddTimings))
	.post(
		validators.validatePreparationTime,
		validators.validateSittingTime,
		validators.validateReportingTime,
		saveBodyToSession('hearingEstimates'),
		asyncHandler(controller.postAddTimings)
	);

addRouter
	.route('/check-details')
	.get(asyncHandler(controller.getAddCheckDetails))
	.post(asyncHandler(controller.postAddCheckDetails));

changeRouter.get('/', controller.redirectAndClearSession('/change/timings', 'hearingEstimates'));

changeRouter
	.route('/timings')
	.get(asyncHandler(controller.getChangeTimings))
	.post(
		validators.validatePreparationTime,
		validators.validateSittingTime,
		validators.validateReportingTime,
		saveBodyToSession('hearingEstimates'),
		asyncHandler(controller.postChangeTimings)
	);

changeRouter
	.route('/check-details')
	.get(asyncHandler(controller.getChangeCheckDetails))
	.post(asyncHandler(controller.postChangeCheckDetails));

export default router;
