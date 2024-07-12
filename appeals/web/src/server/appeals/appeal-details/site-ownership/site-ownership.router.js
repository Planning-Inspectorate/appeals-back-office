import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './site-ownership.controller.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeSiteOwnership))
	.post(validateAppeal, asyncHandler(controllers.postChangeSiteOwnership));

export default router;
