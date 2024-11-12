import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './add-ip-comment.controller.js';
import {
	validateCheckAddress,
	validateCommentSubmittedDateFields,
	validateCommentSubmittedDateValid,
	validateRedactionStatus,
	validateInterestedPartyDetails,
	validateInterestedPartyAddress
} from './add-ip-comment.validators.js';
import { createDateInputDateInPastOrTodayValidator } from '#lib/validators/date-input.validator.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';

const router = createRouter({ mergeParams: true });

router
	.route('/ip-details')
	.get(asyncHandler(controller.renderIpDetails))
	.post(
		validateInterestedPartyDetails,
		saveBodyToSession('addIpComment'),
		asyncHandler(controller.postIpDetails)
	);

router
	.route('/check-address')
	.get(asyncHandler(controller.renderCheckAddress))
	.post(
		validateCheckAddress,
		saveBodyToSession('addIpComment'),
		asyncHandler(controller.postCheckAddress)
	);

router
	.route('/ip-address')
	.get(asyncHandler(controller.renderIpAddress))
	.post(
		validateInterestedPartyAddress,
		saveBodyToSession('addIpComment'),
		asyncHandler(controller.postIpAddress)
	);

router
	.route('/upload')
	.get(asyncHandler(controller.renderUpload))
	.post(asyncHandler(controller.postUpload));

router
	.route('/redaction-status')
	.get(asyncHandler(controller.renderRedactionStatus))
	.post(
		validateRedactionStatus,
		saveBodyToSession('addIpComment'),
		asyncHandler(controller.postRedactionStatus)
	);

router
	.route('/date-submitted')
	.get(asyncHandler(controller.renderDateSubmitted))
	.post(
		validateCommentSubmittedDateFields,
		validateCommentSubmittedDateValid,
		createDateInputDateInPastOrTodayValidator(),
		saveBodyToSession('addIpComment'),
		asyncHandler(controller.postDateSubmitted)
	);

router
	.route('/check-your-answers')
	.get(asyncHandler(controller.renderCheckYourAnswers))
	.post(asyncHandler(controller.postIPComment));

router.route('/').get(asyncHandler(controller.redirectTopLevel));

export default router;
