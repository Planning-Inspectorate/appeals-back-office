import { validateSingleDwellingHouse } from '#appeals/appeal-details/lpa-questionnaire/single-dwelling-house/single-dwelling-house.validator.js';
import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './single-dwelling-house.controller.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeSingleDwellingHouse))
	.post(validateSingleDwellingHouse, asyncHandler(controllers.postChangeSingleDwellingHouse));

export default router;
