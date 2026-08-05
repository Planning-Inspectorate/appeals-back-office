import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './reason-for-appeal.controller.js';
import * as validators from './reason-for-appeal.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getReasonForAppeal))
	.post(validators.validateTextArea, asyncHandler(controllers.postReasonForAppeal));

export default router;
