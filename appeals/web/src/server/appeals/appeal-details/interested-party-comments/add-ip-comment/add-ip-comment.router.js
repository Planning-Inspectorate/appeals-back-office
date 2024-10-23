import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './add-ip-comment.controller.js';
import { validateCheckAddress, validateRedactionStatus } from './add-ip-comment.validators.js';
import {
	createPostcodeValidator,
	createAddressLine1Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import {
	createEmailValidator,
	createFirstNameValidator,
	createLastNameValidator
} from '#lib/validators/service-user.validator.js';
import { createDateInputDateInPastValidator } from '#lib/validators/date-input.validator.js';
import { saveBodyToSession } from './add-ip-comment.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/ip-details')
	.get(asyncHandler(controller.renderIpDetails))
	.post(
		createFirstNameValidator(),
		createLastNameValidator(),
		createEmailValidator(),
		saveBodyToSession,
		asyncHandler(controller.postIpDetails)
	);

router
	.route('/check-address')
	.get(asyncHandler(controller.renderCheckAddress))
	.post(validateCheckAddress, saveBodyToSession, asyncHandler(controller.postCheckAddress));

router
	.route('/ip-address')
	.get(asyncHandler(controller.renderIpAddress))
	.post(
		createAddressLine1Validator(),
		createTownValidator(),
		createPostcodeValidator(),
		saveBodyToSession,
		asyncHandler(controller.postIpAddress)
	);

router
	.route('/upload')
	.get(asyncHandler(controller.renderUpload))
	.post(asyncHandler(controller.postUpload));

router
	.route('/redaction-status')
	.get(asyncHandler(controller.renderRedactionStatus))
	.post(validateRedactionStatus, saveBodyToSession, asyncHandler(controller.postRedactionStatus));

router
	.route('/date-submitted')
	.get(asyncHandler(controller.renderDateSubmitted))
	.post(
		createDateInputDateInPastValidator(),
		saveBodyToSession,
		asyncHandler(controller.postDateSubmitted)
	);

router
	.route('/check-your-answers')
	.get(asyncHandler(controller.renderCheckYourAnswers))
	.post(asyncHandler(controller.postIPComment));

router.route('/').get(asyncHandler(controller.redirectTopLevel));

export default router;
