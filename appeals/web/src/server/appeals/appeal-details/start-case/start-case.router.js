import { Router as createRouter } from 'express';
import * as controller from './start-case.controller.js';
import asyncRoute from '#lib/async-route.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncRoute(controller.getStartDate))
	.post(asyncRoute(controller.postStartDate));

router.route('/confirmation').get(asyncRoute(controller.getConfirmation));

export default router;
