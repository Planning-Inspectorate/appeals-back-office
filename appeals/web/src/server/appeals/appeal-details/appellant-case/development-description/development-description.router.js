import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './development-description.controller.js';
import * as validators from './development-description.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeDevelopmentDescription))
	.post(validators.validateTextArea, asyncHandler(controllers.postChangeDevelopmentDescription));

export default router;
