import { Router as createRouter } from 'express';
import asyncRoute from '#lib/async-route.js';
import * as allocationDetailsController from './allocation-details.controller.js';
import * as validators from './allocation-details.validators.js';
import { validateAppeal } from '../appeal-details.middleware.js';
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
		asyncRoute(allocationDetailsController.getAllocationDetailsLevels)
	)
	.post(
		validateAppeal,
		validators.validateAllocationDetailsLevels,
		assertUserHasPermission(permissionNames.updateCase),
		asyncRoute(allocationDetailsController.postAllocationDetailsLevels)
	);

router
	.route('/allocation-specialism')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncRoute(allocationDetailsController.getAllocationDetailsSpecialism)
	)
	.post(
		validateAppeal,
		validators.validateAllocationDetailsSpecialisms,
		assertUserHasPermission(permissionNames.updateCase),
		asyncRoute(allocationDetailsController.postAllocationDetailsSpecialism)
	);

router
	.route('/check-answers')
	.get(
		validateAppeal,
		assertUserHasPermission(
			permissionNames.viewCaseDetails,
			permissionNames.viewAssignedCaseDetails
		),
		asyncRoute(allocationDetailsController.getAllocationDetailsCheckAnswers)
	)
	.post(
		validateAppeal,
		assertUserHasPermission(permissionNames.updateCase),
		asyncRoute(allocationDetailsController.postAllocationDetailsCheckAnswers)
	);

export default router;
