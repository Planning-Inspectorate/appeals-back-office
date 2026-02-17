import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { dateFieledName } from './hearing.constants.js';
import * as validators from './set-up-hearing-validators.js';
import * as controller from './set-up-hearing.controller.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/date', 'changeHearing'));

router
	.route('/date')
	.get(asyncHandler(controller.getChangeHearingDate))
	.post(
		validators.validateHearingDateTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieledName
		}),
		saveBodyToSession('changeHearing'),
		asyncHandler(controller.postChangeHearingDate)
	);

router
	.route('/estimation')
	.get(asyncHandler(controller.getChangeHearingEstimation))
	.post(
		validators.validateYesNoInput,
		validators.validateEstimationInput,
		saveBodyToSession('changeHearing'),
		asyncHandler(controller.postChangeHearingEstimation)
	);

router
	.route('/address')
	.get(asyncHandler(controller.getChangeHearingAddress))
	.post(
		validators.validateAddressKnown,
		saveBodyToSession('changeHearing'),
		asyncHandler(controller.postChangeHearingAddress)
	);

router
	.route('/address-details')
	.get(asyncHandler(controller.getChangeHearingAddressDetails))
	.post(
		validators.validateHearingAddress,
		saveBodyToSession('changeHearing'),
		asyncHandler(controller.postChangeHearingAddressDetails)
	);

router
	.route('/check-details')
	.get(asyncHandler(controller.getChangeHearingCheckDetails))
	.post(asyncHandler(controller.postChangeHearingCheckDetails));

export default router;
