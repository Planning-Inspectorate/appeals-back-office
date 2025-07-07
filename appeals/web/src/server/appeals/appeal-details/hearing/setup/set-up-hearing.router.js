import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './set-up-hearing.controller.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import * as validators from './set-up-hearing-validators.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { dateFieledName } from './set-up-hearing.constants.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/date', 'setUpHearing'));

router
	.route('/date')
	.get(asyncHandler(controller.getHearingDate))
	.post(
		validators.validateHearingDateTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieledName
		}),
		saveBodyToSession('setUpHearing'),
		asyncHandler(controller.postHearingDate)
	);

router
	.route('/address')
	.get(asyncHandler(controller.getHearingAddress))
	.post(
		validators.validateAddressKnown,
		saveBodyToSession('setUpHearing'),
		asyncHandler(controller.postHearingAddress)
	);

router
	.route('/address-details')
	.get(asyncHandler(controller.getHearingAddressDetails))
	.post(
		validators.validateHearingAddress,
		saveBodyToSession('setUpHearing'),
		asyncHandler(controller.postHearingAddressDetails)
	);

router
	.route('/check-details')
	.get(asyncHandler(controller.getHearingCheckDetails))
	.post(asyncHandler(controller.postHearingCheckDetails));

export default router;
