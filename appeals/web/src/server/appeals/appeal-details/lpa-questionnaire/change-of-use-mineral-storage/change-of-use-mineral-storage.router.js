import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './change-of-use-mineral-storage.controller.js';
import { validateChangeOfUseMineralStorage } from './change-of-use-mineral-storage.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeOfUseMineralStorage))
	.post(validateChangeOfUseMineralStorage, asyncHandler(controllers.postChangeOfUseMineralStorage));

export default router;
