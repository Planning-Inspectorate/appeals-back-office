import { saveBodyToSession } from '#lib/middleware/save-body-to-session.js';
import { createYesNoRadioValidator } from '#lib/validators/radio.validator.js';
import { Router } from 'express';
import {
	validateAllocationLevel,
	validateAllocationSpecialisms
} from '../allocation/allocation.validator.js';
import {
	postAcceptStatement,
	postAllocationCheck,
	postAllocationLevel,
	postAllocationSpecialisms,
	renderAllocationCheck,
	renderAllocationLevel,
	renderAllocationSpecialisms,
	renderConfirm
} from './valid.controller.js';

const router = Router({ mergeParams: true });

router
	.route('/allocation-check')
	.get(renderAllocationCheck)
	.post(
		createYesNoRadioValidator(
			'allocationLevelAndSpecialisms',
			'Select whether the allocation level and specialisms need updating'
		),
		saveBodyToSession('acceptAppellantStatement', { scopeToAppeal: true }),
		postAllocationCheck
	);

router
	.route('/allocation-level')
	.get(renderAllocationLevel)
	.post(
		validateAllocationLevel,
		saveBodyToSession('acceptAppellantStatement', { scopeToAppeal: true }),
		postAllocationLevel
	);

router
	.route('/allocation-specialisms')
	.get(renderAllocationSpecialisms)
	.post(
		validateAllocationSpecialisms,
		saveBodyToSession('acceptAppellantStatement', { scopeToAppeal: true }),
		postAllocationSpecialisms
	);

router.route('/confirm').get(renderConfirm).post(postAcceptStatement);

export default router;
