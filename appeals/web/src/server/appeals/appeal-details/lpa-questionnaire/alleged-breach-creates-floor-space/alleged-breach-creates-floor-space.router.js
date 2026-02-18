import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './alleged-breach-creates-floor-space.controller.js';
import { validateAllegedBreachCreatesFloorSpace } from './alleged-breach-creates-floor-space.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeFloorSpaceCreatedByBreachInSquareMetres))
	.post(
		validateAllegedBreachCreatesFloorSpace,
		asyncHandler(controllers.postChangeFloorSpaceCreatedByBreachInSquareMetres)
	);

export default router;
