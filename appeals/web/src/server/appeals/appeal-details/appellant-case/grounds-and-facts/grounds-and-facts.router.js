import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './grounds-and-facts.controller.js';
import { validateGroundsAndFacts } from './grounds-and-facts.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/')
	.get(
		asyncHandler(controllers.getGroundsAndFacts)
	)
		.post(
			...validateGroundsAndFacts,
			asyncHandler(controllers.postGroundsAndFacts)
		);

export default router;
