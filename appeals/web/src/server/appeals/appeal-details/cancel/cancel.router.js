import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './cancel.controller.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { validateCancelReason } from './cancel.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, asyncHandler(controller.getCancelAppealPage))
	.post(validateAppeal, validateCancelReason, asyncHandler(controller.postCancelAppeal));

export default router;
