import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controllers from './safety-risks.controller.js';
import * as validators from './safety-risks.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(asyncRoute(controllers.getChangeSafetyRisks))
	.post(validators.validateChangeSafetyRisks, asyncRoute(controllers.postChangeSafetyRisks));

export default router;
