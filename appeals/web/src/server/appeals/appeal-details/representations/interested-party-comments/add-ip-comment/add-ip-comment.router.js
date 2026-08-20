import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { extractAndProcessDocumentDateErrors } from '#lib/validators/date-input.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as documentsValidators from '../../../../appeal-documents/appeal-documents.validators.js';
import { validateInterestedPartyAddress } from '../common/validators.js';
import * as controller from './add-ip-comment.controller.js';
import {
	validateCheckAddress,
	validateInterestedPartyDetails
} from './add-ip-comment.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/ip-details')
	.get(saveBackUrl('addIpComment'), asyncHandler(controller.renderIpDetails))
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
	.route('/add-document-details')
	.get(asyncHandler(controller.renderDocumentDetails))
	.post(
		documentsValidators.validateDocumentDetailsBodyFormat,
		documentsValidators.validateDocumentDetailsReceivedDatesFields,
		documentsValidators.validateDocumentDetailsReceivedDateValid,
		documentsValidators.validateDocumentDetailsReceivedDateIsNotFutureDate,
		documentsValidators.validateDocumentDetailsRedactionStatuses,
		extractAndProcessDocumentDateErrors(),
		asyncHandler(controller.postDocumentDetails)
	);

router
	.route('/check-your-answers')
	.get(asyncHandler(controller.renderCheckYourAnswers))
	.post(asyncHandler(controller.postIPComment));

router.route('/').get(asyncHandler(controller.redirectToAdd));

export default router;
