import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { applicaitonDecisionDateField } from './application-decision-date.constants.js';
import * as controllers from './application-decision-date.controller.js';
import * as validators from './application-decision-date.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeApplicationDecisionDate))
	.post(
		validators.validateDateFields,
		validators.validateDateValid,
		validators.validatePastDate,
		extractAndProcessDateErrors({
			fieldNamePrefix: applicaitonDecisionDateField
		}),
		asyncHandler(controllers.postChangeApplicationDecisionDate)
	);

export default router;
