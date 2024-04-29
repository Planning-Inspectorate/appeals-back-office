import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controllers from './site-ownership.controller.js';
//import * as validators from './site-ownership.validator.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncRoute(controllers.getChangeSiteOwnership))
	.post(validateAppeal, asyncRoute(controllers.postChangeSiteOwnership));

export default router;
