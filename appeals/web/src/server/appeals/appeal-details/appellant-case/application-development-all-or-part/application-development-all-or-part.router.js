import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './application-development-all-or-part.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeApplicationDevelopmentAllOrPart))
	.post(asyncHandler(controllers.postChangeApplicationDevelopmentAllOrPart));

export default router;
