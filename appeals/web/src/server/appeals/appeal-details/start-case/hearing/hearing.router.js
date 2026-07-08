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
		saveBodyToSession('startCaseAppealProcedure', { scopeToAppeal: true }),
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
		saveBodyToSession('startCaseAppealProcedure', { scopeToAppeal: true }),
		asyncHandler(controller.postHearingDate)
	);

router
	.route('/estimation')
	.get(asyncHandler(controller.getHearingEstimation))
	.post(
		validators.validateEstimationYesNo,
		validators.validateEstimationDays,
		saveBodyToSession('startCaseAppealProcedure', { scopeToAppeal: true }),
		asyncHandler(controller.postHearingEstimation)
	);

router
	.route('/confirm')
	.get(asyncHandler(controller.getHearingConfirm))
	.post(asyncHandler(controller.postHearingConfirm));

export default router;
