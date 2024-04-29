import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import * as controllers from './address.controller.js';
import * as validators from './address.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:addressId')
	.get(validateAppeal, asyncRoute(controllers.getChangeSiteAddress))
	.post(
		validateAppeal,
		validators.validateChangeSiteAddress,
		validators.validatePostCode,
		asyncRoute(controllers.postChangeSiteAddress)
	);

export default router;
