import { asyncHandler } from '@pins/express';
import { Router as createRouter } from 'express';
import * as controllers from './affected-listed-buildings.controller.js';
import * as validators from './affected-listed-buildings.validator.js';

const router = createRouter({ mergeParams: true });

router
	.route('/add')
	.get(asyncHandler(controllers.getAddAffectedListedBuilding))
	.post(
		validators.validateAffectedListedBuilding,
		asyncHandler(controllers.postAddAffectedListedBuilding)
	);

router
	.route('/add/check-and-confirm')
	.get(asyncHandler(controllers.getAddAffectedListedBuildingCheckAndConfirm))
	.post(asyncHandler(controllers.postAddAffectedListedBuildingCheckAndConfirm));

router.route('/manage').get(asyncHandler(controllers.getManageAffectedListedBuildings));

router
	.route('/change/:listedBuildingId')
	.get(asyncHandler(controllers.getChangeAffectedListedBuilding))
	.post(
		validators.validateAffectedListedBuilding,
		asyncHandler(controllers.postChangeAffectedListedBuilding)
	);

router
	.route('/change/:listedBuildingId/check-and-confirm')
	.get(asyncHandler(controllers.getChangeAffectedListedBuildingCheckAndConfirm))
	.post(asyncHandler(controllers.postChangeAffectedListedBuildingCheckAndConfirm));

router
	.route('/remove/:listedBuildingId')
	.get(asyncHandler(controllers.getRemoveAffectedListedBuilding))
	.post(asyncHandler(controllers.postRemoveAffectedListedBuilding));

export default router;
