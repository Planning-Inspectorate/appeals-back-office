import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './set-up-inquiry.controller.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import * as validators from './set-up-inquiry-validators.js';
import { runDueDateDaysValidator } from './set-up-inquiry-validators.js';
import { createNotEmptyBodyValidator } from '#lib/validators/generic.validator.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/date', 'setUpInquiry'));

router
	.route('/date')
	.get(asyncHandler(controller.getInquiryDate))
	.post(
		validators.validateInquiryDateTime,
		saveBodyToSession('setUpInquiry'),
		asyncHandler(controller.postInquiryDate)
	);

router
	.route('/estimation')
	.get(asyncHandler(controller.getInquiryEstimation))
	.post(
		validators.validateYesNoInput,
		validators.validateEstimationInput,
		saveBodyToSession('setUpInquiry'),
		asyncHandler(controller.postInquiryEstimation)
	);

router
	.route('/address')
	.get(asyncHandler(controller.getInquiryAddress))
	.post(
		validators.validateAddressKnown,
		saveBodyToSession('setUpInquiry'),
		asyncHandler(controller.postInquiryAddress)
	);

router
	.route('/address-details')
	.get(asyncHandler(controller.getInquiryAddressDetails))
	.post(
		validators.validateInquiryAddress,
		saveBodyToSession('setUpInquiry'),
		asyncHandler(controller.postInquiryAddressDetails)
	);

router
	.route('/timetable-due-dates')
	.get(asyncHandler(controller.getInquiryDueDates))
	.post(
		createNotEmptyBodyValidator('whole-page::Enter timetable due dates'),
		runDueDateDaysValidator,
		saveBodyToSession('setUpInquiry'),
		asyncHandler(controller.postInquiryDueDates)
	);
router
	.route('/check-details')
	.get(asyncHandler(controller.getInquiryCheckDetails))
	.post(asyncHandler(controller.postInquiryCheckDetails));

export default router;
