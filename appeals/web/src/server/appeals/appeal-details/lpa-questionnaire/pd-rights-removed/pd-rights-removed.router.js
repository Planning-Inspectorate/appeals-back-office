import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './pd-rights-removed.controller.js';
import * as validators from './pd-rights-removed.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangePdRightsRemoved))
	.post(
		validators.validateChangePdRightsRemoved,
		asyncHandler(controllers.postChangePdRightsRemoved)
	);

export default router;
