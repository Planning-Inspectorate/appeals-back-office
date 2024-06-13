import { Router as createRouter } from 'express';
import * as controller from './start-case.controller.js';
import asyncRoute from '#lib/async-route.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncRoute(controller.getStartDate))
	.post(asyncRoute(controller.postStartDate));

router.route('/add/confirmation').get(asyncRoute(controller.getAddConfirmation));

router
	.route('/change')
	.get(asyncRoute(controller.getChangeDate))
	.post(asyncRoute(controller.postChangeDate));

router.route('/change/confirmation').get(asyncRoute(controller.getChangeConfirmation));

export default router;
