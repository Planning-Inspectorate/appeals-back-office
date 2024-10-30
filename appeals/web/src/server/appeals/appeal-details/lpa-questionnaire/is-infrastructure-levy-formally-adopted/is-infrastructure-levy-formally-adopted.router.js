import { Router as createRouter } from 'express';
import * as controllers from './is-infrastructure-levy-formally-adopted.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsInfrastructureLevyFormallyAdopted))
	.post(asyncHandler(controllers.postChangeIsInfrastructureLevyFormallyAdopted));

export default router;
