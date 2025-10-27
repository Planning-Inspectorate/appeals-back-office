import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './appellant-photos-and-plans.controller.js';
import { validateAppellantPhotosAndPlans } from './appellant-photos-and-plans.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeAppellantPhotosAndPlans))
	.post(
		validateAppellantPhotosAndPlans,
		asyncHandler(controllers.postChangeAppellantPhotosAndPlans)
	);

export default router;
