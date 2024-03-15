import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import { validateAppeal } from '../appeal-details.middleware.js';
import * as validators from './other-appeals.validators.js';
import * as controller from './other-appeals.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(validateAppeal, asyncRoute(controller.getAddOtherAppeals))
	.post(
		validateAppeal,
		validators.validateAddOtherAppealsReference,
		asyncRoute(controller.postAddOtherAppeals)
	);

router
	.route('/confirm')
	.get(validateAppeal, asyncRoute(controller.getConfirmOtherAppeals))
	.post(
		validateAppeal,
		validators.validateRelateAppealAnswer,
		asyncRoute(controller.postConfirmOtherAppeals)
	);

router.route('/manage').get(validateAppeal, asyncRoute(controller.getManageOtherAppeals));

router
	.route('/remove/:relatedAppealShortReference/:relationshipId')
	.get(validateAppeal, asyncRoute(controller.getRemoveOtherAppeals))
	.post(
		validateAppeal,
		validators.validateRemoveRelateAppealAnswer,
		asyncRoute(controller.postRemoveOtherAppeals)
	);

export default router;
