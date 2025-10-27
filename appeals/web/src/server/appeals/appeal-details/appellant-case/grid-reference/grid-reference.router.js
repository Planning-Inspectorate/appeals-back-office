import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './grid-reference.controller.js';
import { validateGridReference } from './grid-reference.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeSiteGridReference))
	.post(validateGridReference, asyncHandler(controllers.postChangeSiteGridReference));

export default router;
