import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import * as controllers from './site-ownership.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeSiteOwnership))
	.post(validateAppeal, asyncHandler(controllers.postChangeSiteOwnership));

export default router;
