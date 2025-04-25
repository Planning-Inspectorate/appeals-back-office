import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './add-estimates.controller.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import * as validators from './add-estimates.validators.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectToEstimates);

router
	.route('/estimates')
	.get(asyncHandler(controller.getEstimates))
	.post(
		validators.validatePreparationTime,
		validators.validateSittingTime,
		validators.validateReportingTime,
		saveBodyToSession('addEstimates'),
		asyncHandler(controller.postEstimates)
	);

router.get('/check-details', asyncHandler(controller.getCheckDetails));

export default router;
