import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controllers from './safety-risks.controller.js';
import * as validators from './safety-risks.validator.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(validateAppeal, asyncRoute(controllers.getChangeSafetyRisks))
	.post(
		validateAppeal,
		validators.validateChangeSafetyRisks,
		asyncRoute(controllers.postChangeSafetyRisks)
	);

export default router;
