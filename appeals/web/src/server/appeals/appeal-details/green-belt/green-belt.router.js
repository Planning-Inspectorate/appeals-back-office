import { Router as createRouter } from 'express';
import * as controllers from './green-belt.controller.js';
import { asyncHandler } from '@pins/express';
import { vaidateGreenbeltRadio } from './green-belt.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(asyncHandler(controllers.getChangeGreenBelt))
	.post(vaidateGreenbeltRadio, asyncHandler(controllers.postGreenBelt));

export default router;
