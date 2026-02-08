import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './retrospective-application.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeRetrospectiveApplication))
	.post(asyncHandler(controllers.postChangeRetrospectiveApplication));

export default router;
