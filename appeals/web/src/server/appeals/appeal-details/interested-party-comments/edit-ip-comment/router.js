import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	createPostcodeValidator,
	createAddressLine1Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import * as controller from './controller.js';
import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';

const router = createRouter({ mergeParams: true });

router
	.route('/address')
	.get(asyncHandler(controller.renderEditAddress))
	.post(
		createAddressLine1Validator(),
		createTownValidator(),
		createPostcodeValidator(),
		saveBodyToSession('editIpComment'),
		asyncHandler(controller.postEditAddress)
	);

router
	.route('/check/address')
	.get(asyncHandler(controller.renderCheckAddress))
	.post(asyncHandler(controller.postCheckPage));

export default router;
