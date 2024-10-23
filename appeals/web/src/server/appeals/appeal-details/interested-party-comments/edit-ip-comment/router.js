import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import {
	createPostcodeValidator,
	createAddressLine1Validator,
	createTownValidator
} from '#lib/validators/address.validator.js';
import * as controller from './controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/address')
	.get(asyncHandler(controller.renderEditAddress))
	.post(
		createAddressLine1Validator(),
		createTownValidator(),
		createPostcodeValidator(),
		asyncHandler(controller.postEditAddress)
	);

export default router;
