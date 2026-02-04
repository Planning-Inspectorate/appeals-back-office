import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './trunk-road.controller.js';
import * as validators from './trunk-road.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeTrunkRoad))
	.post(validators.validateChangeTrunkRoad, asyncHandler(controllers.postChangeTrunkRoad));

export default router;
