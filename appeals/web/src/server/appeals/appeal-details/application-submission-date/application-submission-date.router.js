import { Router as createRouter } from 'express';
import * as controllers from './application-submission-date.controller.js';
import asyncRoute from '#lib/async-route.js';
import * as validators from './application-submission-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncRoute(controllers.getChangeApplicationSubmissionDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		asyncRoute(controllers.postChangeApplicationSubmissionDate)
	);

export default router;
