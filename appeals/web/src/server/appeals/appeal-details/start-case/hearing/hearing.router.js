import { validateHearingDateTime } from '#appeals/appeal-details/hearing/setup/set-up-hearing-validators.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './hearing.controller.js';
import * as validators from './hearing.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getHearingDateKnown))
	.post(
		validators.validateDateKnown,
		saveBodyToSession('startCaseHearing'),
		asyncHandler(controller.postHearingDateKnown)
	);

router
	.route('/date')
	.get(asyncHandler(controller.getHearingDate))
	.post(
		validateHearingDateTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: 'hearing-date'
		}),
		saveBodyToSession('startCaseHearing'),
		asyncHandler(controller.postHearingDate)
	);

export default router;
