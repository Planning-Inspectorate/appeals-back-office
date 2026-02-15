import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './retrospective-application.controller.js';
import { validateRetrospectiveApplication } from './retrospective-application.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeRetrospectiveApplication))
	.post(
		validateRetrospectiveApplication,
		asyncHandler(controllers.postChangeRetrospectiveApplication)
	);

export default router;
