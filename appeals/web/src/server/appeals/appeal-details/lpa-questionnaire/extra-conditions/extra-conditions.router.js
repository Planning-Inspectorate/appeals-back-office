import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './extra-conditions.controller.js';
import * as validators from './extra-conditions.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeExtraConditions))
	.post(
		validators.validateChangeExtraConditions,
		asyncHandler(controllers.postChangeExtraConditions)
	);

export default router;
