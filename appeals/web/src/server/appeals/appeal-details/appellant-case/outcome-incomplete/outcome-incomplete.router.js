import { Router as createRouter } from 'express';
import * as controller from './outcome-incomplete.controller.js';
import * as validators from './outcome-incomplete.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(controller.getIncompleteReason)
	.post(
		validators.validateIncompleteReason,
		validators.validateIncompleteReasonTextItems,
		controller.postIncompleteReason
	);

router
	.route('/date')
	.get(controller.getUpdateDueDate)
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInFuture,
		controller.postUpdateDueDate
	);

export default router;
