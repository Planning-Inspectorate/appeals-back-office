import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as controller from './manage-linked-appeals.controller.js';
import * as validators from './manage-linked-appeals.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncRoute(controller.getAddLinkedAppealReference))
	.post(validators.validateAddLinkedAppealReference, asyncRoute(controller.postAddLinkedAppeal));

router
	.route('/add/check-and-confirm')
	.get(asyncRoute(controller.getAddLinkedAppealCheckAndConfirm))
	.post(
		validators.validateAddLinkedAppealCheckAndConfirm,
		asyncRoute(controller.postAddLinkedAppealCheckAndConfirm)
	);

router.route('/manage').get(asyncRoute(controller.getManageLinkedAppeals));

router
	.route('/unlink-appeal/:childId/:relationshipId/:backLinkAppealId')
	.get(asyncRoute(controller.getUnlinkAppeal))
	.post(validators.validateUnlinkAppeal, asyncRoute(controller.postUnlinkAppeal));

export default router;
