import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './has-protected-species.controller.js';
import { validateAffectsProtectedSpecies } from './has-protected-species.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHasProtectedSpecies))
	.post(validateAffectsProtectedSpecies, asyncHandler(controllers.postChangeHasProtectedSpecies));

export default router;
