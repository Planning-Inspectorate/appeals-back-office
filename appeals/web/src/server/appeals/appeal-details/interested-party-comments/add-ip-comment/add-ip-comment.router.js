import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './add-ip-comment.controller.js';
import { validateCheckAddress } from './add-ip-comment.validators.js';
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

const router = createRouter({ mergeParams: true });

router
	.route('/ip-details')
	.get(asyncHandler(controller.renderIpDetails))
	.post(
		createFirstNameValidator(),
		createLastNameValidator(),
		createEmailValidator(),
		asyncHandler(controller.postIpDetails)
	);

router
	.route('/check-address')
	.get(asyncHandler(controller.renderCheckAddress))
	.post(validateCheckAddress, asyncHandler(controller.postCheckAddress));

router
	.route('/ip-address')
	.get(asyncHandler(controller.renderIpAddress))
	.post(
		createAddressLine1Validator(),
		createTownValidator(),
		createPostcodeValidator(),
		asyncHandler(controller.postIpAddress)
	);

router.route('/upload').get(asyncHandler(controller.renderUpload));

router.route('/').get(asyncHandler(controller.redirectTopLevel));

export default router;
