import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '../../appeal-details.middleware.js';

import {
	getRedactFinalComment,
	postRedactFinalComment,
	getConfirmRedactFinalComment,
	postConfirmRedactFinalComment
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
