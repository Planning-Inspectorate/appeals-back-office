import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './invalid.controller.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import { validateCancelReason } from './invalid.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/new')
	.get(validateAppeal, asyncHandler(controller.getInvalidAppealReasonsPage))
	.post(validateAppeal, validateCancelReason, asyncHandler(controller.postInvalidAppealReasons));

export default router;
