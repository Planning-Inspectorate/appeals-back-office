import { Router as createRouter } from 'express';
import * as controller from './invalid-appeal.controller.js';
import * as validators from './invalid-appeal.validators.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { asyncHandler } from '@pins/express';
import { permissionNames } from '#environment/permissions.js';
import { postCheckAndConfirm } from '../appellant-case/appellant-case.controller.js';

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

export default router;
