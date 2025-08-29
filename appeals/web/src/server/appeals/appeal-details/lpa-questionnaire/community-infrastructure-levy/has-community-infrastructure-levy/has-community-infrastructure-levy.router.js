import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './has-community-infrastructure-levy.controller.js';
import { validateChangeHasCommunityInfrastructureLevy } from './has-community-infrastructure-levy.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeHasCommunityInfrastructureLevy))
	.post(
		validateChangeHasCommunityInfrastructureLevy,
		asyncHandler(controllers.postChangeHasCommunityInfrastructureLevy)
	);

export default router;
