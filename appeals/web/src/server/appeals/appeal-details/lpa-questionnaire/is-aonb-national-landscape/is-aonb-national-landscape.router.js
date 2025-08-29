import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './is-aonb-national-landscape.controller.js';
import { validateAONB } from './is-aonb-national-landscape.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsAonbNationalLandscape))
	.post(validateAONB, asyncHandler(controllers.postChangeIsAonbNationalLandscape));

export default router;
