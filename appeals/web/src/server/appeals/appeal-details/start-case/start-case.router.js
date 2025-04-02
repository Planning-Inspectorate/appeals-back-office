import { Router as createRouter } from 'express';
import * as controller from './start-case.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncHandler(controller.getStartDate))
	.post(asyncHandler(controller.postStartDate));

router
	.route('/change')
	.get(asyncHandler(controller.getChangeDate))
	.post(asyncHandler(controller.postChangeDate));

router.route('/select-procedure').get(asyncHandler(controller.getSelectProcedure));

export default router;
