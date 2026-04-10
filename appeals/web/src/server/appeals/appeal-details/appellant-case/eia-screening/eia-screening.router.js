import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './eia-screening.controller.js';
import * as validators from './eia-screening.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeEiaScreening))
	.post(validators.validateEiaScreeningRadio, asyncHandler(controllers.postChangeEiaScreening));

export default router;
