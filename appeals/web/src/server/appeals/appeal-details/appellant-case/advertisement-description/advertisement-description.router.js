import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './advertisement-description.controller.js';
import * as validators from './advertisement-description.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeAdvertisementDescription))
	.post(validators.validateTextArea, asyncHandler(controllers.postChangeAdvertisementDescription));

export default router;
