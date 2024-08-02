import { Router as createRouter } from 'express';
import * as controllers from './appeal-costs-application.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeAppealCostsApplication))
	.post(asyncHandler(controllers.postChangeAppealCostsApplication));

export default router;
