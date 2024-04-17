import { Router as createRouter } from 'express';
import * as controllers from './inspector-access.controller.js';
import asyncRoute from '#lib/async-route.js';
import * as validators from './inspector-access.validators.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(validateAppeal, asyncRoute(controllers.getChangeInspectorAccess))
	.post(
		validateAppeal,
		validators.validateDetails,
		asyncRoute(controllers.postChangeInspectorAccess)
	);

export default router;
