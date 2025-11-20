import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { enforcementIssueDateField } from './enforcement-issue-date.constants.js';
import * as controllers from './enforcement-issue-date.controller.js';
import * as validators from './enforcement-issue-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeEnforcementIssueDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInPastOrToday,
		extractAndProcessDateErrors({
			fieldNamePrefix: enforcementIssueDateField
		}),
		asyncHandler(controllers.postChangeEnforcementIssueDate)
	);

export default router;
