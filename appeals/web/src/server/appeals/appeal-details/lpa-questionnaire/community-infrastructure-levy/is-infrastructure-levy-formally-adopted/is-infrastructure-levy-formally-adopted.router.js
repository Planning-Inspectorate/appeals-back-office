import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './is-infrastructure-levy-formally-adopted.controller.js';
import { validateChangeIsCommunityInfrastructureLevyFormallyAdopted } from './is-infrastructure-levy-formally-adopted.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeIsInfrastructureLevyFormallyAdopted))
	.post(
		validateChangeIsCommunityInfrastructureLevyFormallyAdopted,
		asyncHandler(controllers.postChangeIsInfrastructureLevyFormallyAdopted)
	);

export default router;
