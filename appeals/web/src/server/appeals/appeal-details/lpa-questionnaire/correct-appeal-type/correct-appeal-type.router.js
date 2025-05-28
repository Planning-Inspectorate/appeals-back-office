import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as controllers from './correct-appeal-type.controller.js';
import { validateAppeal } from '../../appeal-details.middleware.js';
import { validateCorrectAppealType } from './correct-appeal-type.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(validateAppeal, asyncHandler(controllers.getChangeCorrectAppealType))
	.post(
		validateAppeal,
		validateCorrectAppealType,
		asyncHandler(controllers.postChangeCorrectAppealType)
	);

export default router;
