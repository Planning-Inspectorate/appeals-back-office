import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postCheckAndConfirm } from '../appellant-case/appellant-case.controller.js';
import * as controller from './invalid-appeal.controller.js';
import * as validators from './invalid-appeal.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route(['/', '/new'])
	.get(controller.getInvalidReason)
	.post(
		validators.validateInvalidReason,
		validators.validateInvalidReasonTextItems,
		controller.postInvalidReason
	);

router.route('/confirmation').get(controller.getConfirmation);

router
	.route('/check')
	.get(controller.getCheckPage)
	.post(assertUserHasPermission(permissionNames.setCaseOutcome), asyncHandler(postCheckAndConfirm));

router.route('/view').get(controller.getInvalidPage);

router
	.route('/enforcement-notice')
	.get(controller.getEnforcementNoticeInvalid)
	.post(validators.validateEnforcementNoticeInvalid, controller.postEnforcementNoticeInvalid);

router
	.route('/other-live-appeals')
	.get(controller.getOtherLiveAppeals)
	.post(validators.validateOtherLiveAppeals, controller.postOtherLiveAppeals);

export default router;
