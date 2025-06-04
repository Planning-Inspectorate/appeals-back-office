import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './outcome-incomplete.controller.js';
import * as validators from './outcome-incomplete.validators.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { dateFieldNamePrefix } from './outcome-incomplete.constants.js';

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
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieldNamePrefix
		}),
		asyncHandler(controller.postUpdateDueDate)
	);

export default router;
