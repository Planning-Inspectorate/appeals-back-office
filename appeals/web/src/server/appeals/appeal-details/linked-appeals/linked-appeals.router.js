import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './linked-appeals.controller.js';
import * as validators from './linked-appeals.validators.js';
import { initialiseLinkedAppealsSession } from './linked-appeals.middleware.js';

const router = createRouter({ mergeParams: true });

router.use(initialiseLinkedAppealsSession);

router
	.route('/add')
	.get(asyncHandler(controller.renderAddLinkedAppealReference))
	.post(validators.validateAddLinkedAppealReference, asyncHandler(controller.postAddLinkedAppeal));

router
	.route('/add/already-linked')
	.get(asyncHandler(controller.renderAlreadyLinked))
	.post(asyncHandler(controller.postAlreadyLinked));

router
	.route('/add/lead-appeal')
	.get(asyncHandler(controller.renderLeadAppeal))
	.post(validators.validateChangeLeadAppeal, asyncHandler(controller.postLeadAppeal));

router
	.route('/add/check-and-confirm')
	.get(asyncHandler(controller.renderAddLinkedAppealCheckAndConfirm))
	.post(asyncHandler(controller.postAddLinkedAppealCheckAndConfirm));

router.route('/manage').get(asyncHandler(controller.renderManageLinkedAppeals));

router
	.route('/unlink-appeal/:childId/:relationshipId/:backLinkAppealId')
	.get(asyncHandler(controller.renderUnlinkAppeal))
	.post(validators.validateUnlinkAppeal, asyncHandler(controller.postUnlinkAppeal));

export default router;
