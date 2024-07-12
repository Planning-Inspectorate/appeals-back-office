import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './correct-appeal-type.controller.js';
import { validateAppeal } from '../appeal-details.middleware.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeCorrectAppealType))
	.post(validateAppeal, asyncHandler(controllers.postChangeCorrectAppealType));

export default router;
