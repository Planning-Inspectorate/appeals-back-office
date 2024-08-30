import { Router as createRouter } from 'express';
import * as controllers from './lpa-reference.controller.js';
import { asyncHandler } from '@pins/express';
import * as validators from './lpa-reference.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeLpaReference))
	.post(validators.validateChangeLpaReference, asyncHandler(controllers.postChangeLpaReference));

export default router;
