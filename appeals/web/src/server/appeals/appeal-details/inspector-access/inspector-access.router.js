import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './inspector-access.controller.js';
import * as validators from './inspector-access.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change/:source')
	.get(asyncHandler(controllers.getChangeInspectorAccess))
	.post(validators.validateDetails, asyncHandler(controllers.postChangeInspectorAccess));

export default router;
