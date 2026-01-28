import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './change-of-use-refuse-or-waste.controller.js';
import { validateChangeOfUseRefuseOrWaste } from './change-of-use-refuse-or-waste.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeOfUseRefuseOrWaste))
	.post(validateChangeOfUseRefuseOrWaste, asyncHandler(controllers.postChangeOfUseRefuseOrWaste));

export default router;
