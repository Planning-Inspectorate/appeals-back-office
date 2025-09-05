import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { dateFieledName } from './inquiry.constants.js';
import * as validators from './set-up-inquiry-validators.js';
import * as controller from './set-up-inquiry.controller.js';

const router = createRouter({ mergeParams: true });

router.get('/', controller.redirectAndClearSession('/date', 'changeInquiry'));

router
	.route('/date')
	.get(asyncHandler(controller.getChangeInquiryDate))
	.post(
		validators.validateInquiryDateTime,
		extractAndProcessDateErrors({
			fieldNamePrefix: dateFieledName
		}),
		saveBodyToSession('changeInquiry'),
		asyncHandler(controller.postChangeInquiryDate)
	);

router
	.route('/address')
	.get(asyncHandler(controller.getChangeInquiryAddress))
	.post(
		validators.validateAddressKnown,
		saveBodyToSession('changeInquiry'),
		asyncHandler(controller.postChangeInquiryAddress)
	);

router
	.route('/address-details')
	.get(asyncHandler(controller.getChangeInquiryAddressDetails))
	.post(
		validators.validateInquiryAddress,
		saveBodyToSession('changeInquiry'),
		asyncHandler(controller.postChangeInquiryAddressDetails)
	);

router
	.route('/estimation')
	.get(asyncHandler(controller.getChangeInquiryEstimation))
	.post(
		validators.validateYesNoInput,
		validators.validateEstimationInput,
		saveBodyToSession('changeInquiry'),
		asyncHandler(controller.postChangeInquiryEstimation)
	);

router
	.route('/check-details')
	.get(asyncHandler(controller.getChangeInquiryCheckDetails))
	.post(asyncHandler(controller.postChangeInquiryCheckDetails));

export default router;
