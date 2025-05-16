import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './set-up-hearing.controller.js';
import {
	createDateInputDateValidityValidator,
	createDateInputDateInFutureValidator,
	createDateInputFieldsValidator
} from '#lib/validators/date-input.validator.js';
import { createTimeInputValidator } from '#lib/validators/time-input.validator.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import * as validators from './set-up-hearing-validators.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/date', 'setUpHearing'));

router
	.route('/date')
	.get(asyncHandler(controller.getHearingDate))
	.post(
		createDateInputFieldsValidator('hearing-date', 'Hearing date'),
		createDateInputDateValidityValidator('hearing-date', 'Hearing date'),
		createDateInputDateInFutureValidator('hearing-date', 'Hearing date'),
		createTimeInputValidator('hearing-time', 'hearing time'),
		saveBodyToSession('setUpHearing'),
		asyncHandler(controller.postHearingDate)
	);

router
	.route('/address')
	.get(asyncHandler(controller.getHearingAddress))
	.post(
		createYesNoRadioValidator(
			'addressKnown',
			'Select yes if you know the address of where the hearing will take place'
		),
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
