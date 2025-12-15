import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './written-or-verbal-permission.controller.js';
import { validateWrittenOrVerbalPermission } from './written-or-verbal-permission.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getWrittenOrVerbalPermission))
	.post(validateWrittenOrVerbalPermission, asyncHandler(controllers.postWrittenOrVerbalPermission));

export default router;
