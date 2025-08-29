import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './safety-risks.controller.js';
import * as validators from './safety-risks.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(asyncHandler(controllers.getChangeSafetyRisks))
	.post(validators.validateChangeSafetyRisks, asyncHandler(controllers.postChangeSafetyRisks));

export default router;
