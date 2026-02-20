import {
	LINK_APPEALS_CHANGE_LEAD_OPERATION,
	LINK_APPEALS_UNLINK_OPERATION
} from '@pins/appeals/constants/support.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import addRouter from './add/add.router.js';
import * as controller from './linked-appeals.controller.js';
import { initialiseLinkedAppealsSession } from './linked-appeals.middleware.js';
import { validateLeadAppeal } from './linked-appeals.validators.js';

const router = createRouter({ mergeParams: true });

router.use('/add', addRouter);

router
	.route('/manage')
	.get(initialiseLinkedAppealsSession, asyncHandler(controller.renderManageLinkedAppeals));

router
	.route('/unlink-appeal/:appealId')
	.get(asyncHandler(controller.renderUnlinkAppeal))
	.post(asyncHandler(controller.postUnlinkAppeal));

router
	.route('/unlink-lead-appeal')
	.get(asyncHandler(controller.renderChangeLeadAppeal(LINK_APPEALS_UNLINK_OPERATION)))
	.post(
		validateLeadAppeal,
		asyncHandler(controller.postChangeLeadAppeal(LINK_APPEALS_UNLINK_OPERATION))
	);

router
	.route('/change-lead-appeal')
	.get(asyncHandler(controller.renderChangeLeadAppeal(LINK_APPEALS_CHANGE_LEAD_OPERATION)))
	.post(
		validateLeadAppeal,
		asyncHandler(controller.postChangeLeadAppeal(LINK_APPEALS_CHANGE_LEAD_OPERATION))
	);

router
	.route('/confirm-unlink-lead-appeal')
	.get(asyncHandler(controller.renderConfirmChangeLeadAppeal(LINK_APPEALS_UNLINK_OPERATION)))
	.post(asyncHandler(controller.postConfirmChangeLeadAppeal(LINK_APPEALS_UNLINK_OPERATION)));

router
	.route('/confirm-change-lead-appeal')
	.get(asyncHandler(controller.renderConfirmChangeLeadAppeal(LINK_APPEALS_CHANGE_LEAD_OPERATION)))
	.post(asyncHandler(controller.postConfirmChangeLeadAppeal(LINK_APPEALS_CHANGE_LEAD_OPERATION)));

export default router;
