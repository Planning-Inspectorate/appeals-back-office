import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './changed-listed-buildings.controller.js';
import * as validators from './changed-listed-buildings.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncHandler(controllers.getAddChangedListedBuilding))
	.post(
		validators.validateChangedListedBuilding,
		asyncHandler(controllers.postAddChangedListedBuilding)
	);

router
	.route('/add/check-and-confirm')
	.get(asyncHandler(controllers.getAddChangedListedBuildingCheckAndConfirm))
	.post(asyncHandler(controllers.postAddChangedListedBuildingCheckAndConfirm));

router.route('/manage').get(asyncHandler(controllers.getManageChangedListedBuildings));

router
	.route('/change/:listedBuildingId')
	.get(asyncHandler(controllers.getChangeChangedListedBuilding))
	.post(
		validators.validateChangedListedBuilding,
		asyncHandler(controllers.postChangeChangedListedBuilding)
	);

router
	.route('/change/:listedBuildingId/check-and-confirm')
	.get(asyncHandler(controllers.getChangeChangedListedBuildingCheckAndConfirm))
	.post(asyncHandler(controllers.postChangeChangedListedBuildingCheckAndConfirm));

router
	.route('/remove/:listedBuildingId')
	.get(asyncHandler(controllers.getRemoveChangedListedBuilding))
	.post(asyncHandler(controllers.postRemoveChangedListedBuilding));

export default router;
