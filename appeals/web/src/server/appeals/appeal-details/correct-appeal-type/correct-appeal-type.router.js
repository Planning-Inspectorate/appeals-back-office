import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controllers from './correct-appeal-type.controller.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncRoute(controllers.getChangeCorrectAppealType))
	.post(validateAppeal, asyncRoute(controllers.postChangeCorrectAppealType));

export default router;
