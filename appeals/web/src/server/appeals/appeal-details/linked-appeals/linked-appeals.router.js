import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import addRouter from './add/add.router.js';
import * as controller from './linked-appeals.controller.js';
import { initialiseLinkedAppealsSession } from './linked-appeals.middleware.js';

const router = createRouter({ mergeParams: true });

router.use(initialiseLinkedAppealsSession);

router.use('/add', addRouter);

router.route('/manage').get(asyncHandler(controller.renderManageLinkedAppeals));

router
	.route('/unlink-appeal/:appealId')
	.get(asyncHandler(controller.renderUnlinkAppeal))
	.post(asyncHandler(controller.postUnlinkAppeal));

export default router;
