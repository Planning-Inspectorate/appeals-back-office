import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './lpa-reference.controller.js';
import { ensureBeforeLpaq } from './lpa-reference.middleware.js';
import * as validators from './lpa-reference.validators.js';
const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(ensureBeforeLpaq, asyncHandler(controllers.getChangeLpaReference))
	.post(
		ensureBeforeLpaq,
		validators.validateChangeLpaReference,
		asyncHandler(controllers.postChangeLpaReference)
	);

export default router;
