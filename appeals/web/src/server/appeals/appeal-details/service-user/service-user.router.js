import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controller from './service-user.controller.js';
import * as validators from './service-user.validators.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:userType')
	.get(validateAppeal, asyncRoute(controller.getChangeServiceUser))
	.post(
		validateAppeal,
		validators.validateChangeServiceUser,
		asyncRoute(controller.postChangeServiceUser)
	);

export default router;
