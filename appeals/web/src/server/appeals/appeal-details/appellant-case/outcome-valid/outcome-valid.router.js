import { Router as createRouter } from 'express';
import * as controller from './outcome-valid.controller.js';
import * as validators from './outcome-valid.validators.js';
import asyncRoute from '#lib/async-route.js';
import { validateAppeal } from '../../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/date')
	.get(validateAppeal, controller.getValidDate)
	.post(
		validateAppeal,
		validators.validateValidDateFields,
		validators.validateValidDateValid,
		validators.validateValidDateInPastOrToday,
		asyncRoute(controller.postValidDate)
	);

router.route('/confirmation').get(validateAppeal, controller.getConfirmation);

export default router;
