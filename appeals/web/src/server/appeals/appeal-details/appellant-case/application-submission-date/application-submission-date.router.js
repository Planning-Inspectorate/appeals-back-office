import { Router as createRouter } from 'express';
import * as controllers from './application-submission-date.controller.js';
import { asyncHandler } from '@pins/express';
import * as validators from './application-submission-date.validators.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { applicationSubmissionDateField } from './application-submission-date.constants.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeApplicationSubmissionDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInPastOrToday,
		extractAndProcessDateErrors({
			fieldNamePrefix: applicationSubmissionDateField
		}),
		asyncHandler(controllers.postChangeApplicationSubmissionDate)
	);

export default router;
