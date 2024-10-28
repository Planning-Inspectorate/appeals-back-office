import { Router as createRouter } from 'express';
import * as controllers from './is-aonb-national-landscape.controller.js';
import { asyncHandler } from '@pins/express';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsAonbNationalLandscape))
	.post(asyncHandler(controllers.postChangeIsAonbNationalLandscape));

export default router;
