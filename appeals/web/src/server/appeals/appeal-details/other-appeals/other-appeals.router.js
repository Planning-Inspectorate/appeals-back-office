import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './other-appeals.controller.js';
import * as validators from './other-appeals.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncHandler(controller.getAddOtherAppeals))
	.post(validators.validateAddOtherAppealsReference, asyncHandler(controller.postAddOtherAppeals));

router
	.route('/confirm')
	.get(asyncHandler(controller.getConfirmOtherAppeals))
	.post(validators.validateRelateAppealAnswer, asyncHandler(controller.postConfirmOtherAppeals));

router.route('/manage').get(asyncHandler(controller.getManageOtherAppeals));

router
	.route('/remove/:relatedAppealShortReference/:relationshipId')
	.get(asyncHandler(controller.getRemoveOtherAppeals))
	.post(
		validators.validateRemoveRelateAppealAnswer,
		asyncHandler(controller.postRemoveOtherAppeals)
	);

export default router;
