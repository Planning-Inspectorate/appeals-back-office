import { validateAction } from '#appeals/appeal-details/service-user/service-user.middleware.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './service-user.controller.js';
import * as validators from './service-user.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/remove/:userType')
	.get(asyncHandler(controller.getRemoveServiceUser))
	.post(asyncHandler(controller.postRemoveServiceUser));

router
	.route('/:action/:userType')
	.all(validateAction)
	.get(asyncHandler(controller.getChangeServiceUser))
	.post(validators.validateChangeServiceUser, asyncHandler(controller.postChangeServiceUser));

export default router;
