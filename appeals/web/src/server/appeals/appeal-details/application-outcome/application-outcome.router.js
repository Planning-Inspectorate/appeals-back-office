import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './application-outcome.controller.js';
import * as validators from './application-outcome.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/')
	.get(asyncHandler(controllers.getApplicationOutcome))
	.post(validators.validateChangeSafetyRisks, asyncHandler(controllers.postApplicationOutcome));

export default router;
