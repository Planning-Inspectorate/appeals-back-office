import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';

import { getAcceptProofOfEvidence, postConfirmAcceptProofOfEvidence } from './accept.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(getAcceptProofOfEvidence))
	.post(asyncHandler(postConfirmAcceptProofOfEvidence));

export default router;
