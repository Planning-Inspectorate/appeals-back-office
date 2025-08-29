import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { validateAppeal } from '../../appeal-details.middleware.js';
import * as controllers from './planning-obligation.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/status/change')
	.get(validateAppeal, asyncHandler(controllers.getChangePlanningObligationStatus))
	.post(validateAppeal, asyncHandler(controllers.postChangePlanningObligationStatus));

export default router;
