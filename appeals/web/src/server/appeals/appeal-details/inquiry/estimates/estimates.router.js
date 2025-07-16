import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './estimates.controller.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import * as validators from './estimates.validators.js';

const router = createRouter({ mergeParams: true });
const addRouter = createRouter({ mergeParams: true });
const changeRouter = createRouter({ mergeParams: true });

router.use('/add', addRouter);
router.use('/change', changeRouter);

addRouter.get('/', controller.redirectAndClearSession('/add/timings', 'inquiryEstimates'));

addRouter
	.route('/timings')
	.get(asyncHandler(controller.getAddTimings))
	.post(
		validators.validatePreparationTime,
		validators.validateSittingTime,
		validators.validateReportingTime,
		saveBodyToSession('inquiryEstimates'),
		asyncHandler(controller.postAddTimings)
	);

addRouter
	.route('/check-details')
	.get(asyncHandler(controller.getAddCheckDetails))
	.post(asyncHandler(controller.postAddCheckDetails));

changeRouter.get('/', controller.redirectAndClearSession('/change/timings', 'inquiryEstimates'));

changeRouter
	.route('/timings')
	.get(asyncHandler(controller.getChangeTimings))
	.post(
		validators.validatePreparationTime,
		validators.validateSittingTime,
		validators.validateReportingTime,
		saveBodyToSession('inquiryEstimates'),
		asyncHandler(controller.postChangeTimings)
	);

changeRouter
	.route('/check-details')
	.get(asyncHandler(controller.getChangeCheckDetails))
	.post(asyncHandler(controller.postChangeCheckDetails));

export default router;
