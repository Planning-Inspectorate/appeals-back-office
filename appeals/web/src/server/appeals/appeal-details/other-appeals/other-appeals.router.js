import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as validators from './other-appeals.validators.js';
import * as controller from './other-appeals.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncRoute(controller.getAddOtherAppeals))
	.post(validators.validateAddOtherAppealsReference, asyncRoute(controller.postAddOtherAppeals));

router
	.route('/confirm')
	.get(asyncRoute(controller.getConfirmOtherAppeals))
	.post(validators.validateRelateAppealAnswer, asyncRoute(controller.postConfirmOtherAppeals));

router.route('/manage').get(asyncRoute(controller.getManageOtherAppeals));

router
	.route('/remove/:relatedAppealShortReference/:relationshipId')
	.get(asyncRoute(controller.getRemoveOtherAppeals))
	.post(validators.validateRemoveRelateAppealAnswer, asyncRoute(controller.postRemoveOtherAppeals));

export default router;
