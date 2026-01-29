import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './relates-to-erection-buildings.controller.js';
import { validateRelatesToErectionBuildings } from './relates-to-erection-buildings.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getRelatesToErectionBuildings))
	.post(
		validateRelatesToErectionBuildings,
		asyncHandler(controllers.postRelatesToErectionBuildings)
	);

export default router;
