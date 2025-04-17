import { Router as createRouter } from 'express';
import * as controllers from './local-planning-authority.controller.js';
import * as validators from './local-planning-authority.validators.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controllers.getChangeLpa))
	.post(validators.validateLpa, asyncHandler(controllers.postChangeLpa));

export default router;
