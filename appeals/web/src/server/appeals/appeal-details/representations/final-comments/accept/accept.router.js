import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

import { getAcceptFinalComment, postConfirmAcceptFinalComment } from './accept.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(getAcceptFinalComment))
	.post(asyncHandler(postConfirmAcceptFinalComment));

export default router;
