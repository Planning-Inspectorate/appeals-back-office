import { Router as createRouter } from 'express';
import { asyncHandler } from '@pins/express';
import * as allocationDetailsController from './allocation-details.controller.js';
import * as validators from './allocation-details.validators.js';
import { validateAppeal } from '../../middleware.js';
import { assertUserHasPermission } from '#app/auth/auth.guards.js';
import { permissionNames } from '#environment/permissions.js';

const router = createRouter({ mergeParams: true });

router
	.route('/allocation-level')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(allocationDetailsController.getAllocationDetailsLevels)
	)
	.post(
		validateAppeal,
		validators.validateAllocationDetailsLevels,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(allocationDetailsController.postAllocationDetailsLevels)
	);

router
	.route('/allocation-specialism')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(allocationDetailsController.getAllocationDetailsSpecialism)
	)
	.post(
		validateAppeal,
		validators.validateAllocationDetailsSpecialisms,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(allocationDetailsController.postAllocationDetailsSpecialism)
	);

router
	.route('/check-answers')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncHandler(allocationDetailsController.getAllocationDetailsCheckAnswers)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncHandler(allocationDetailsController.postAllocationDetailsCheckAnswers)
	);

export default router;
