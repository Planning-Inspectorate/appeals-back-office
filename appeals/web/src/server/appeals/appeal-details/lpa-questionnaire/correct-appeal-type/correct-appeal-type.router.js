import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './correct-appeal-type.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeCorrectAppealType))
	.post(asyncHandler(controllers.postChangeCorrectAppealType));

export default router;
