import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controller from './linked-appeals.controller.js';
import * as validators from './linked-appeals.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncHandler(controller.getAddLinkedAppealReference))
	.post(validators.validateAddLinkedAppealReference, asyncHandler(controller.postAddLinkedAppeal));

router
	.route('/add/check-and-confirm')
	.get(asyncHandler(controller.getAddLinkedAppealCheckAndConfirm))
	.post(
		validators.validateAddLinkedAppealCheckAndConfirm,
		asyncHandler(controller.postAddLinkedAppealCheckAndConfirm)
	);

router.route('/manage').get(asyncHandler(controller.getManageLinkedAppeals));

router
	.route('/unlink-appeal/:childId/:relationshipId/:backLinkAppealId')
	.get(asyncHandler(controller.getUnlinkAppeal))
	.post(validators.validateUnlinkAppeal, asyncHandler(controller.postUnlinkAppeal));

export default router;
