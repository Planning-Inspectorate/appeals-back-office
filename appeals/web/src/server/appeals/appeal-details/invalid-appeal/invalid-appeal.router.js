import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import { postCheckAndConfirm } from '../appellant-case/appellant-case.controller.js';
import {
	getEnforcementOtherInformation,
	postEnforcementOtherInformation
} from '../appellant-case/outcome-valid/outcome-valid.controller.js';
import {
	validateOtherInformation,
	validateOtherInterestInLand
} from '../appellant-case/outcome-valid/outcome-valid.validators.js';
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
	.route('/enforcement-notice-reason')
	.get(controller.getEnforcementNoticeReason)
	.post(
		validators.validateEnforcementNoticeReason,
		validators.validateEnforcementNoticeReasonTextItems,
		controller.postEnforcementNoticeReason
	);

router
	.route('/enforcement-other-information')
	.get(getEnforcementOtherInformation)
	.post(
		validateOtherInformation,
		validateOtherInterestInLand,
		asyncHandler(postEnforcementOtherInformation)
	);

router
	.route('/other-live-appeals')
	.get(controller.getOtherLiveAppeals)
	.post(validators.validateOtherLiveAppeals, controller.postOtherLiveAppeals);

router
	.route('/check-details-and-mark-enforcement-as-invalid')
	.get(controller.getCheckDetailsAndMarkEnforcementAsInvalid)
	.post(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCheckDetailsAndMarkEnforcementAsInvalid)
	);

export default router;
