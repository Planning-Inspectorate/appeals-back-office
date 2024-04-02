import { Router as createRouter } from 'express';
import * as controller from './start-case.controller.js';
import asyncRoute from '#lib/async-route.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/date')
	.get(validateAppeal, asyncRoute(controller.getStartDate))
	.post(validateAppeal, asyncRoute(controller.postStartDate));

router.route('/confirmation').get(validateAppeal, asyncRoute(controller.getConfirmation));

export default router;
