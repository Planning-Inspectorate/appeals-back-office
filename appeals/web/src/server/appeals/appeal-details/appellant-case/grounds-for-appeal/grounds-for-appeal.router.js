import { validateGroundsForAppeal } from '#appeals/appeal-details/appellant-case/grounds-for-appeal/grounds-for-appeal.validators.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './grounds-for-appeal.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeGroundsForAppeal))
	.post(validateGroundsForAppeal, asyncHandler(controllers.postChangeGroundsForAppeal));

export default router;
