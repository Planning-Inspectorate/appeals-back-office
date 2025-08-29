import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './address.controller.js';
import * as validators from './address.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:addressId')
	.get(asyncHandler(controllers.getChangeSiteAddress))
	.post(validators.validateChangeSiteAddress, asyncHandler(controllers.postChangeSiteAddress));

export default router;
