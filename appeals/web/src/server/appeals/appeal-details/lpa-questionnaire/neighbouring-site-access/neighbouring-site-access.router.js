import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './neighbouring-site-access.controller.js';
import * as validators from './neighbouring-site-access.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/change')
	.get(asyncHandler(controllers.getChangeNeighbouringSiteAccess))
	.post(
		validators.validateNeighbouringSiteAccessTextArea,
		asyncHandler(controllers.postChangeNeighbouringSiteAccess)
	);

export default router;
