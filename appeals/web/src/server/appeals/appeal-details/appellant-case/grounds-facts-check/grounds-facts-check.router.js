import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './grounds-facts-check.controller.js';
import { validateGroundsAndFacts } from './grounds-facts-check.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(asyncHandler(controllers.getGroundsFactsCheck))
	.post(...validateGroundsAndFacts, asyncHandler(controllers.postGroundsFactsCheck));

export default router;
