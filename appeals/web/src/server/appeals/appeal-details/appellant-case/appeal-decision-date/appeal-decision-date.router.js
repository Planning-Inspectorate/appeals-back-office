import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { appealDecisionDateField } from './appeal-decision-date.constants.js';
import * as controllers from './appeal-decision-date.controller.js';
import * as validators from './appeal-decision-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeAppealDecisionDate))
	.post(
		validators.validateDueDateFields,
		validators.validateDueDateValid,
		validators.validateDueDateInPastOrToday,
		extractAndProcessDateErrors({
			fieldNamePrefix: appealDecisionDateField
		}),
		asyncHandler(controllers.postChangeAppealDecisionDate)
	);

export default router;
