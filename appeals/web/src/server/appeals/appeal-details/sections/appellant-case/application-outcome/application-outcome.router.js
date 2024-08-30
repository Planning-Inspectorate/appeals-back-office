import { Router as createRouter } from 'express';
import * as controllers from './application-outcome.controller.js';
import { asyncHandler } from '@pins/express';
import { validateOutcome } from './application-outcome.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeApplicationOutcome))
	.post(validateOutcome, asyncHandler(controllers.postChangeApplicationOutcome));

export default router;
