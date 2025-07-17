import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './linked-appeals.controller.js';
import * as validators from './linked-appeals.validators.js';
import { initialiseLinkedAppealsSession } from './linked-appeals.middleware.js';
import addRouter from './add/add.router.js';

const router = createRouter({ mergeParams: true });

router.use(initialiseLinkedAppealsSession);

router.use('/add', addRouter);

router.route('/manage').get(asyncHandler(controller.renderManageLinkedAppeals));

router
	.route('/unlink-appeal/:childId/:relationshipId/:backLinkAppealId')
	.get(asyncHandler(controller.renderUnlinkAppeal))
	.post(validators.validateUnlinkAppeal, asyncHandler(controller.postUnlinkAppeal));

export default router;
