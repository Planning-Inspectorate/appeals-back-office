import { Router as createRouter } from 'express';
import * as controllers from './inspector-access.controller.js';
import asyncRoute from '#lib/async-route.js';
import * as validators from './inspector-access.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(asyncRoute(controllers.getChangeInspectorAccess))
	.post(validators.validateDetails, asyncRoute(controllers.postChangeInspectorAccess));

export default router;
