import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './add.controller.js';
import { initialiseLinkedAppealsSession } from './add.middleware.js';
import * as validators from './add.validators.js';

const router = createRouter({ mergeParams: true });

router.use(initialiseLinkedAppealsSession);

router
	.route('/')
	.get(asyncHandler(controller.renderAddLinkedAppealReference))
	.post(validators.validateAddLinkedAppealReference, asyncHandler(controller.postAddLinkedAppeal));

router
	.route('/already-linked')
	.get(asyncHandler(controller.renderAlreadyLinked))
	.post(asyncHandler(controller.postAlreadyLinked));

router
	.route('/invalid-case-status')
	.get(asyncHandler(controller.renderInvalidCaseStatus))
	.post(asyncHandler(controller.postInvalidCaseStatus));

router
	.route('/lead-appeal')
	.get(asyncHandler(controller.renderLeadAppeal))
	.post(validators.validateChangeLeadAppeal, asyncHandler(controller.postLeadAppeal));

router
	.route('/check-and-confirm')
	.get(asyncHandler(controller.renderAddLinkedAppealCheckAndConfirm))
	.post(asyncHandler(controller.postAddLinkedAppealCheckAndConfirm));

export default router;
