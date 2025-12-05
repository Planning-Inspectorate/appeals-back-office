import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './facts-for-ground.controller.js';
import * as validators from './facts-for-ground.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/:groundRef/change')
	.get(asyncHandler(controllers.renderChangeFactsForGround))
	.post(validators.validateFactsForGround, asyncHandler(controllers.postChangeFactsForGround));

export default router;
