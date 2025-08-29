import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './outcome-valid.controller.js';
import * as validators from './outcome-valid.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/date')
	.get(controller.getValidDate)
	.post(
		validators.validateValidDateFields,
		validators.validateValidDateValid,
		validators.validateValidDateInPastOrToday,
		extractAndProcessDateErrors({
			fieldNamePrefix: 'valid-date'
		}),
		asyncHandler(controller.postValidDate)
	);

export default router;
