import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './remove.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(saveBackUrl('removeRule6Party'), asyncHandler(controller.getConfirm))
	.post(asyncHandler(controller.postConfirm));

export default router;
