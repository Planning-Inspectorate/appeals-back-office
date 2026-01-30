import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './site-area.controller.js';
import * as validators from './site-area.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeSiteArea))
	.post(validators.validateSiteArea, asyncHandler(controllers.postChangeSiteArea));

export default router;
