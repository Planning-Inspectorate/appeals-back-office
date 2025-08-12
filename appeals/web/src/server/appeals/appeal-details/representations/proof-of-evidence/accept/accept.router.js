import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import { validateAppeal } from '#appeals/appeal-details/appeal-details.middleware.js';

import { getAcceptProofOfEvidence, postConfirmAcceptProofOfEvidence } from './accept.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(validateAppeal, asyncHandler(getAcceptProofOfEvidence))
	.post(validateAppeal, asyncHandler(postConfirmAcceptProofOfEvidence));

export default router;
