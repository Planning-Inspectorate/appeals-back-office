import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './is-on-crown-land.controller.js';
import { validateIsOnCrownLand } from './is-on-crown-land.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsOnCrownLand))
	.post(validateIsOnCrownLand, asyncHandler(controllers.postChangeIsOnCrownLand));

export default router;
