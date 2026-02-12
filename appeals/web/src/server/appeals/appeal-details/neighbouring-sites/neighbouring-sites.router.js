import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controller from './neighbouring-sites.controller.js';
import * as validators from './neighbouring-sites.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add/:source')
	.get(asyncHandler(controller.getAddNeighbouringSite))
	.post(validators.validateAddNeighbouringSite, asyncHandler(controller.postAddNeighbouringSite));

router
	.route('/add/:source/check-and-confirm')
	.get(asyncHandler(controller.getAddNeighbouringSiteCheckAndConfirm))
	.post(asyncHandler(controller.postAddNeighbouringSiteCheckAndConfirm));

router.route('/manage').get(asyncHandler(controller.getManageNeighbouringSites));

router
	.route('/remove/site/:siteId')
	.get(asyncHandler(controller.getRemoveNeighbouringSite))
	.post(
		validators.validateNeighbouringSiteDeleteAnswer,
		asyncHandler(controller.postRemoveNeighbouringSite)
	);

router
	.route('/change/site/:siteId')
	.get(asyncHandler(controller.getChangeNeighbouringSite))
	.post(
		validators.validateAddNeighbouringSite,
		asyncHandler(controller.postChangeNeighbouringSite)
	);

router
	.route('/change/site/:siteId/check-and-confirm')
	.get(asyncHandler(controller.getChangeNeighbouringSiteCheckAndConfirm))
	.post(
		validators.validateAppealId,
		asyncHandler(controller.postChangeNeighbouringSiteCheckAndConfirm)
	);

export default router;
