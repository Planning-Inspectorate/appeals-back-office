import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controller from './outcome-incomplete.controller.js';
import * as validators from './outcome-incomplete.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncRoute(controller.getIncompleteReason))
	.post(
		validators.validateIncompleteReason,
		validators.validateIncompleteReasonTextItems,
		asyncRoute(controller.postIncompleteReason)
	);

router
	.route('/date')
	.get(asyncRoute(controller.getUpdateDueDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInFuture,
		validators.validateDueDateIsBusinessDay,
		asyncRoute(controller.postUpdateDueDate)
	);

router.route('/confirmation').get(asyncRoute(controller.getConfirmation));

export default router;
