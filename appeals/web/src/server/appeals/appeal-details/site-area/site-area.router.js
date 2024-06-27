import { Router as createRouter } from 'express';
import * as controllers from './site-area.controller.js';
import asyncRoute from '#lib/async-route.js';
import * as validators from './site-area.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncRoute(controllers.getChangeSiteArea))
	.post(validators.validateSiteArea, asyncRoute(controllers.postChangeSiteArea));

export default router;
