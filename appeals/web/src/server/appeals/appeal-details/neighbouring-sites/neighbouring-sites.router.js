import { Router as createRouter } from 'express';
import * as controller from './neighbouring-sites.controller.js';
import asyncRoute from '#lib/async-route.js';
import * as validators from './neighbouring-sites.validators.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add/:source')
	.get(asyncRoute(controller.getAddNeighbouringSite))
	.post(
		validators.validateAddNeighbouringSite,
		validators.validatePostCode,
		asyncRoute(controller.postAddNeighbouringSite)
	);

router
	.route('/add/:source/check-and-confirm')
	.get(asyncRoute(controller.getAddNeighbouringSiteCheckAndConfirm))
	.post(asyncRoute(controller.postAddNeighbouringSiteCheckAndConfirm));

router.route('/manage').get(asyncRoute(controller.getManageNeighbouringSites));

router
	.route('/remove/site/:siteId')
	.get(asyncRoute(controller.getRemoveNeighbouringSite))
	.post(
		validators.validateNeighbouringSiteDeleteAnswer,
		asyncRoute(controller.postRemoveNeighbouringSite)
	);

router
	.route('/change/affected')
	.get(asyncRoute(controller.getChangeNeighbouringSiteAffected))
	.post(asyncRoute(controller.postChangeNeighbouringSiteAffected));

router
	.route('/change/site/:siteId')
	.get(asyncRoute(controller.getChangeNeighbouringSite))
	.post(
		validators.validateAddNeighbouringSite,
		validators.validatePostCode,
		asyncRoute(controller.postChangeNeighbouringSite)
	);

router
	.route('/change/site/:siteId/check-and-confirm')
	.get(asyncRoute(controller.getChangeNeighbouringSiteCheckAndConfirm))
	.post(asyncRoute(controller.postChangeNeighbouringSiteCheckAndConfirm));

export default router;
