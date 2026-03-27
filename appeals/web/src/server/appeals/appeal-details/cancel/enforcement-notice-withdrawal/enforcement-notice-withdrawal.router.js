import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './enforcement-notice-withdrawal.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controller.getDocumentUpload))
	.post(asyncHandler(controller.postDocumentUpload));

router
	.route('/check-details')
	.get(asyncHandler(controller.getCheckDetails))
	.post(
		assertUserHasPermission(permissionNames.setCaseOutcome),
		asyncHandler(controller.postCheckDetails)
	);

export default router;
