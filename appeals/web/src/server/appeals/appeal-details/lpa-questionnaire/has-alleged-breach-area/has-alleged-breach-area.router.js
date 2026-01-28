import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './has-alleged-breach-area.controller.js';
import { validateHasAllegedBreachArea } from './has-alleged-breach-area.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHasAllegedBreachArea))
	.post(validateHasAllegedBreachArea, asyncHandler(controllers.postChangeHasAllegedBreachArea));

export default router;
