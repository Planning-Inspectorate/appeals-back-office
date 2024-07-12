import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './service-user.controller.js';
import * as validators from './service-user.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:userType')
	.get(asyncHandler(controller.getChangeServiceUser))
	.post(validators.validateChangeServiceUser, asyncHandler(controller.postChangeServiceUser));

export default router;
