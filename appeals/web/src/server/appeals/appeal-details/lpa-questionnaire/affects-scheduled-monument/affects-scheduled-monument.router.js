import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './affects-scheduled-monument.controller.js';
import { validateAffectsScheduledMonument } from './affects-scheduled-monument.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.renderChangeAffectsScheduledMonument))
	.post(
		validateAffectsScheduledMonument,
		asyncHandler(controllers.postChangeAffectsScheduledMonument)
	);

export default router;
