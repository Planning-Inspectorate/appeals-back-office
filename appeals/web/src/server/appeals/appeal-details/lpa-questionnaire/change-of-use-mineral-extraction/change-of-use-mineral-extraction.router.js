import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './change-of-use-mineral-extraction.controller.js';
import { validateChangeOfUseMineralExtraction } from './change-of-use-mineral-extraction.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeOfUseMineralExtraction))
	.post(
		validateChangeOfUseMineralExtraction,
		asyncHandler(controllers.postChangeOfUseMineralExtraction)
	);

export default router;
