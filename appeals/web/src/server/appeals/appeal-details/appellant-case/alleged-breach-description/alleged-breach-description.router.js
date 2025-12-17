import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './alleged-breach-description.controller.js';
import * as validators from './alleged-breach-description.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.renderChangeAllegedBreachDescription))
	.post(
		validators.validateAllegedBreachDescription,
		asyncHandler(controllers.postChangeAllegedBreachDescription)
	);

export default router;
