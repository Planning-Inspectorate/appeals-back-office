import { Router as createRouter } from 'express';
import * as controller from './outcome-incomplete.controller.js';
import * as validators from './outcome-incomplete.validators.js';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, controller.getIncompleteReason)
	.post(
		validateAppeal,
		validators.validateIncompleteReason,
		validators.validateIncompleteReasonTextItems,
		controller.postIncompleteReason
	);

router
	.route('/date')
	.get(validateAppeal, controller.getUpdateDueDate)
	.post(
		validateAppeal,
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInFuture,
		validators.validateDueDateIsBusinessDay,
		controller.postUpdateDueDate
	);

router.route('/confirmation').get(validateAppeal, controller.getConfirmation);

export default router;
