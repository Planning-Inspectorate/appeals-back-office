import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './site-use-at-time-of-application.controller.js';
import * as validators from './site-use-at-time-of-application.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getSiteUseAtTimeOfApplication))
	.post(validators.validateTextArea, asyncHandler(controllers.postSiteUseAtTimeOfApplication));

export default router;
