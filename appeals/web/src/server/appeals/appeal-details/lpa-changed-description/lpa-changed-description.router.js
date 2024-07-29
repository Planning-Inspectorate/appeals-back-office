import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './lpa-changed-description.controller.js';
import * as validators from './lpa-changed-description.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getLPAChangedDescription))
	.post(
		validators.validateChangeLPAChangedDescription,
		asyncHandler(controllers.postLPAChangedDescription)
	);

export default router;
