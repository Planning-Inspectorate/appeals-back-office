import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { createNotEmptyBodyValidator } from '#lib/validators/generic.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { dateFieledName } from './inquiry.constants.js';
import * as validators from './set-up-inquiry-validators.js';
import { runDueDateDaysValidator } from './set-up-inquiry-validators.js';
import * as controller from './set-up-inquiry.controller.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/date', 'setUpInquiry'));

router
	.route('/date')
	.get(saveBackUrl('setUpInquiry'), asyncHandler(controller.getInquiryDate))
	.post(
		validators.validateInquiryDateTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieledName
		}),
		saveBodyToSession('setUpInquiry', { scopeToAppeal: true }),
		asyncHandler(controller.postInquiryDate)
	);

router
	.route('/estimation')
	.get(asyncHandler(controller.getInquiryEstimation))
	.post(
		validators.validateYesNoInput,
		validators.validateEstimationInput,
		saveBodyToSession('setUpInquiry', { scopeToAppeal: true }),
		asyncHandler(controller.postInquiryEstimation)
	);

router
	.route('/address')
	.get(asyncHandler(controller.getInquiryAddress))
	.post(
		validators.validateAddressKnown,
		saveBodyToSession('setUpInquiry', { scopeToAppeal: true }),
		asyncHandler(controller.postInquiryAddress)
	);

router
	.route('/address-details')
	.get(asyncHandler(controller.getInquiryAddressDetails))
	.post(
		validators.validateInquiryAddress,
		saveBodyToSession('setUpInquiry', { scopeToAppeal: true }),
		asyncHandler(controller.postInquiryAddressDetails)
	);

router
	.route('/timetable-due-dates')
	.get(asyncHandler(controller.getInquiryDueDates))
	.post(
		createNotEmptyBodyValidator('whole-page::Enter timetable due dates'),
		runDueDateDaysValidator,
		saveBodyToSession('setUpInquiry', { scopeToAppeal: true }),
		asyncHandler(controller.postInquiryDueDates)
	);

router
	.route('/check-details')
	.get(asyncHandler(controller.getInquiryCheckDetails))
	.post(asyncHandler(controller.postInquiryCheckDetails));

export default router;
