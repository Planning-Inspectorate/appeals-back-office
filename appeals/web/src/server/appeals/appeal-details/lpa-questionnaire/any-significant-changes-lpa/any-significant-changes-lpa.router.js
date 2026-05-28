import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './any-significant-changes-lpa.controller.js';
import { validateSignificantChangesAndReasonLpa } from './any-significant-changes-lpa.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeSignificantChangesLpa))
	.post(
		validateSignificantChangesAndReasonLpa,
		asyncHandler(controllers.postChangeSignificantChangesLpa)
	);

export default router;
