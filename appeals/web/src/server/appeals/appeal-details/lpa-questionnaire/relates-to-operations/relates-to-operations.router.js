import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './relates-to-operations.controller.js';
import { validateRelatesToOperations } from './relates-to-operations.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeRelatesToOperations))
	.post(validateRelatesToOperations, asyncHandler(controllers.postChangeRelatesToOperations));

export default router;
