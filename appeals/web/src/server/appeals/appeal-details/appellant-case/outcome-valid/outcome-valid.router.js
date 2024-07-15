import { Router as createRouter } from 'express';
import * as controller from './outcome-valid.controller.js';
import * as validators from './outcome-valid.validators.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/date')
	.get(controller.getValidDate)
	.post(
		validators.validateValidDateFields,
		validators.validateValidDateValid,
		validators.validateValidDateInPastOrToday,
		asyncHandler(controller.postValidDate)
	);

export default router;
