import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './change-procedure-estimation.controller.js';
import * as validators from './change-procedure-estimation.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getChangeEstimation))
	.post(
		validators.validateYesNoInput,
		validators.validateEstimationInput,
		saveBodyToSession('changeProcedureType', { scopeToAppeal: true }),
		asyncHandler(controller.postChangeEstimation)
	);

export default router;
