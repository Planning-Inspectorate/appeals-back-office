import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './is-appeal-invalid.controller.js';
import { validateIsAppealInvalid } from './is-appeal-invalid.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsAppealInvalid))
	.post(validateIsAppealInvalid, asyncHandler(controllers.postChangeIsAppealInvalid));

export default router;
