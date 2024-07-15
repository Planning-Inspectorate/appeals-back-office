import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './outcome-incomplete.controller.js';
import * as validators from './outcome-incomplete.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getIncompleteReason))
	.post(
		validators.validateIncompleteReason,
		validators.validateIncompleteReasonTextItems,
		asyncHandler(controller.postIncompleteReason)
	);

router
	.route('/date')
	.get(asyncHandler(controller.getUpdateDueDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInFuture,
		validators.validateDueDateIsBusinessDay,
		asyncHandler(controller.postUpdateDueDate)
	);

router.route('/confirmation').get(asyncHandler(controller.getConfirmation));

export default router;
