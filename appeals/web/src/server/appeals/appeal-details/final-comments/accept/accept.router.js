import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';

import { getAcceptFinalComment, postConfirmAcceptFinalComment } from './accept.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, asyncHandler(getAcceptFinalComment))
	.post(validateAppeal, asyncHandler(postConfirmAcceptFinalComment));

export default router;
