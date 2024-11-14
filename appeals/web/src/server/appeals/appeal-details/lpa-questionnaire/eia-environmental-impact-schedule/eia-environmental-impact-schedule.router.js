import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './eia-environmental-impact-schedule.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeEiaEnvironmentalImpactSchedule))
	.post(asyncHandler(controllers.postChangeEiaEnvironmentalImpactSchedule));

export default router;
