import { saveBackUrl } from '#lib/middleware/save-back-url.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './enforcement-reference.controller.js';
import * as validators from './enforcement-reference.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(
		saveBackUrl('changeEnforcementReference'),
		asyncHandler(controllers.renderChangeEnforcementReference)
	)
	.post(
		validators.validateEnforcementReference,
		asyncHandler(controllers.postChangeEnforcementReference)
	);

export default router;
