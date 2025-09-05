import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './local-planning-authority.controller.js';
import * as validators from './local-planning-authority.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controllers.getChangeLpa))
	.post(validators.validateLpa, asyncHandler(controllers.postChangeLpa));

export default router;
