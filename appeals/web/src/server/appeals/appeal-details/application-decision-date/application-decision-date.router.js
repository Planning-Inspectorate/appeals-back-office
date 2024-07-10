import { Router as createRouter } from 'express';
import * as controllers from './application-decision-date.controller.js';
import asyncRoute from '#lib/async-route.js';
import * as validators from './application-decision-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncRoute(controllers.getChangeApplicationHasDecisionDate))
	.post(asyncRoute(controllers.postChangeApplicationHasDecisionDate));

router
	.route('/change/set-date')
	.get(controllers.getChangeApplicationSetDecisionDate)
	.post(
		validators.validateDateFields,
		validators.validateDateValid,
		validators.validatePastDate,
		controllers.postChangeApplicationSetDecisionDate
	);

export default router;
