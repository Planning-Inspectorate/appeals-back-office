import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './application-development-type.controller.js';
import * as validators from './application-development-type.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeDevelopmentType))
	.post(
		validators.validateDevelopmentTypePresent,
		asyncHandler(controllers.postChangeDevelopmentType)
	);

export default router;
