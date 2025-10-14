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
	.get(asyncHandler(getRedactFinalComment))
	.post(asyncHandler(postRedactFinalComment));

router
	.route('/confirm')
	.get(asyncHandler(getConfirmRedactFinalComment))
	.post(asyncHandler(postConfirmRedactFinalComment));

export default router;
