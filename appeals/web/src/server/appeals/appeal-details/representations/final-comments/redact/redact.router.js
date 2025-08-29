import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

import {
	getConfirmRedactFinalComment,
	getRedactFinalComment,
	postConfirmRedactFinalComment,
	postRedactFinalComment
} from './redact.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, asyncHandler(getRedactFinalComment))
	.post(validateAppeal, asyncHandler(postRedactFinalComment));

router
	.route('/confirm')
	.get(validateAppeal, asyncHandler(getConfirmRedactFinalComment))
	.post(validateAppeal, asyncHandler(postConfirmRedactFinalComment));

export default router;
